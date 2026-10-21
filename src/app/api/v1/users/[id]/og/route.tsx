import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { users, userTopAlbums, albums } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { getProfilePalette } from "@/lib/profile/palettes";

export const instant = false;

interface RouteProps {
  params: Promise<{ id: string }>;
}

let cachedFonts: Array<{
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal";
}> | null = null;

async function getKHTekaFonts() {
  if (cachedFonts) return cachedFonts;
  try {
    const fontsDir = path.join(process.cwd(), "public", "fonts");
    const [reg, med] = await Promise.all([
      fs.readFile(path.join(fontsDir, "KHTeka-Regular.otf")),
      fs.readFile(path.join(fontsDir, "KHTeka-Medium.otf")),
    ]);
    const regBuf = reg.buffer.slice(
      reg.byteOffset,
      reg.byteOffset + reg.byteLength
    );
    const medBuf = med.buffer.slice(
      med.byteOffset,
      med.byteOffset + med.byteLength
    );

    cachedFonts = [
      { name: "KHTeka", data: regBuf, weight: 400, style: "normal" },
      { name: "KHTeka", data: medBuf, weight: 500, style: "normal" },
      { name: "KHTeka", data: medBuf, weight: 600, style: "normal" },
      { name: "KHTeka", data: medBuf, weight: 700, style: "normal" },
      { name: "KHTeka", data: medBuf, weight: 800, style: "normal" },
      { name: "KHTeka", data: medBuf, weight: 900, style: "normal" },
    ];
    return cachedFonts;
  } catch {
    return [];
  }
}

async function getSafeCoverDataUrl(
  coverUrl: string | null,
  origin: string
): Promise<string | null> {
  if (!coverUrl) return null;
  const absoluteUrl =
    coverUrl.startsWith("http://") || coverUrl.startsWith("https://")
      ? coverUrl
      : `${origin}${coverUrl.startsWith("/") ? "" : "/"}${coverUrl}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(absoluteUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id: rawTarget } = await params;
    const target = decodeURIComponent(rawTarget).replace(/^@/, "").trim();
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "og"; // "story", "square", or "og"

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        target
      );

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        themeKey: users.themeKey,
      })
      .from(users)
      .where(
        isUuid
          ? eq(users.id, target)
          : eq(sql`LOWER(${users.username})`, target.toLowerCase())
      )
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const palette = getProfilePalette(user.themeKey);

    const rawUserAlbums = await db
      .select({
        position: userTopAlbums.position,
        coverUrl: userTopAlbums.coverUrl,
        title: albums.title,
        artistName: albums.artistName,
        releaseYear: albums.releaseYear,
      })
      .from(userTopAlbums)
      .innerJoin(albums, eq(userTopAlbums.albumId, albums.id))
      .where(eq(userTopAlbums.userId, user.id))
      .orderBy(asc(userTopAlbums.position))
      .limit(5);

    // Pre-resolve cover images as base64 data URLs to prevent Satori fetch crashes
    const userAlbums = await Promise.all(
      rawUserAlbums.map(async (item) => ({
        ...item,
        coverDataUrl: await getSafeCoverDataUrl(
          item.coverUrl,
          request.nextUrl.origin
        ),
      }))
    );

    // Dimensions based on format
    let width = 1200;
    let height = 630;

    if (format === "story") {
      width = 1080;
      height = 1920;
    } else if (format === "square") {
      width = 1080;
      height = 1080;
    }

    // Load KH Teka font for editorial brand parity
    const fonts = await getKHTekaFonts();

    // 1. STORY FORMAT (1080x1920, 9:16) - Polaroid Rotation Layout
    if (format === "story") {
      const storyCards = [
        {
          pos: 1,
          left: 75,
          top: 380,
          width: 485,
          height: 615,
          artSize: 445,
          rotation: -4.5,
          paddingTop: 20,
          paddingSide: 20,
          paddingBottom: 22,
          numberSize: 54,
          titleSize: 32,
          artistSize: 20,
          gap: 14,
          zIndex: 5,
        },
        {
          pos: 2,
          left: 615,
          top: 410,
          width: 380,
          height: 485,
          artSize: 344,
          rotation: 3.5,
          paddingTop: 18,
          paddingSide: 18,
          paddingBottom: 20,
          numberSize: 42,
          titleSize: 25,
          artistSize: 17,
          gap: 12,
          zIndex: 4,
        },
        {
          pos: 3,
          left: 635,
          top: 960,
          width: 360,
          height: 460,
          artSize: 324,
          rotation: -2.8,
          paddingTop: 18,
          paddingSide: 18,
          paddingBottom: 20,
          numberSize: 40,
          titleSize: 24,
          artistSize: 16,
          gap: 12,
          zIndex: 4,
        },
        {
          pos: 4,
          left: 355,
          top: 1205,
          width: 345,
          height: 440,
          artSize: 309,
          rotation: 2.2,
          paddingTop: 18,
          paddingSide: 18,
          paddingBottom: 20,
          numberSize: 38,
          titleSize: 22,
          artistSize: 15,
          gap: 10,
          zIndex: 6,
        },
        {
          pos: 5,
          left: 75,
          top: 1320,
          width: 280,
          height: 365,
          artSize: 248,
          rotation: -5.5,
          paddingTop: 16,
          paddingSide: 16,
          paddingBottom: 18,
          numberSize: 32,
          titleSize: 19,
          artistSize: 13,
          gap: 8,
          zIndex: 5,
        },
      ];

      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundColor: "#F7F7F7",
              color: "#0E0E0E",
              fontFamily: '"KHTeka", sans-serif',
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Concentric Palette Orbs */}
            {/* Upper Right Concentric Disc */}
            <div
              style={{
                position: "absolute",
                top: -140,
                right: -140,
                width: 600,
                height: 600,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 400,
                height: 400,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.65,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 60,
                right: 60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Bottom Left Concentric Sphere */}
            <div
              style={{
                position: "absolute",
                bottom: -120,
                left: -120,
                width: 440,
                height: 440,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 260,
                height: 260,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.6,
              }}
            />

            {/* Header: Brand & Identity */}
            <div
              style={{
                position: "absolute",
                top: 85,
                left: 75,
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 136,
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  lineHeight: 0.9,
                  color: "#0E0E0E",
                }}
              >
                musi5t
              </span>
              <span
                style={{
                  fontSize: 32,
                  color: "#0E0E0E",
                  opacity: 0.55,
                  fontWeight: 500,
                  marginTop: 14,
                  letterSpacing: "-0.02em",
                }}
              >
                @{user.username}&apos;s definitive album rotation
              </span>
            </div>

            {/* 5 Polaroid Rotation Cards */}
            {storyCards.map((cfg) => {
              const album = userAlbums.find((a) => a.position === cfg.pos);
              const title = album ? album.title : `Slot 0${cfg.pos} uncurated`;
              const subtitle = album
                ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
                : "Empty vinyl slot";

              return (
                <div
                  key={cfg.pos}
                  style={{
                    position: "absolute",
                    left: cfg.left,
                    top: cfg.top,
                    width: cfg.width,
                    height: cfg.height,
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    paddingTop: cfg.paddingTop,
                    paddingLeft: cfg.paddingSide,
                    paddingRight: cfg.paddingSide,
                    paddingBottom: cfg.paddingBottom,
                    boxShadow: "0 24px 50px rgba(0, 0, 0, 0.22)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    transform: `rotate(${cfg.rotation}deg)`,
                    zIndex: cfg.zIndex,
                  }}
                >
                  {/* Square Album Cover */}
                  <div
                    style={{
                      width: cfg.artSize,
                      height: cfg.artSize,
                      display: "flex",
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      backgroundColor: "#111111",
                    }}
                  >
                    {album?.coverDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverDataUrl}
                        alt={album.title}
                        width={cfg.artSize}
                        height={cfg.artSize}
                        style={{
                          width: cfg.artSize,
                          height: cfg.artSize,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: cfg.artSize,
                          height: cfg.artSize,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#111111",
                          color: "#FFFFFF",
                          fontSize: Math.round(cfg.artSize * 0.08),
                          fontWeight: 600,
                        }}
                      >
                        vinyl slot
                      </div>
                    )}
                  </div>

                  {/* Polaroid Chin: Number + Metadata */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 12,
                      width: cfg.artSize,
                      gap: cfg.gap,
                    }}
                  >
                    {/* Rank Number (Accent color for #1, solid black for 2-5) */}
                    <span
                      style={{
                        fontSize: cfg.numberSize,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: cfg.pos === 1 ? palette.accent : "#0E0E0E",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      0{cfg.pos}
                    </span>

                    {/* Title & Artist */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        flex: 1,
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: cfg.titleSize,
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#0E0E0E",
                        }}
                      >
                        {title}
                      </span>
                      <span
                        style={{
                          fontSize: cfg.artistSize,
                          color: "#0E0E0E",
                          opacity: 0.6,
                          fontWeight: 500,
                          lineHeight: 1.15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 65,
                left: 75,
                right: 75,
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#0E0E0E",
                }}
              >
                Curated rotation by @{user.username}
              </span>
              <div
                style={{
                  width: "100%",
                  height: 2,
                  backgroundColor: "rgba(14, 14, 14, 0.12)",
                  marginTop: 20,
                  marginBottom: 16,
                }}
              />
              <span
                style={{
                  fontSize: 26,
                  color: "#0E0E0E",
                  opacity: 0.5,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                musi5t.com/@{user.username}
              </span>
            </div>
          </div>
        ),
        { width, height, fonts }
      );
    }

    // 2. SQUARE FORMAT (1080x1080, 1:1) - Polaroid Composition Layout
    if (format === "square") {
      const squareCards = [
        {
          pos: 1,
          left: 55,
          top: 215,
          width: 320,
          height: 410,
          artSize: 284,
          rotation: -3.5,
          paddingTop: 18,
          paddingSide: 18,
          paddingBottom: 20,
          numberSize: 36,
          titleSize: 22,
          artistSize: 15,
          gap: 10,
          zIndex: 5,
        },
        {
          pos: 2,
          left: 420,
          top: 195,
          width: 265,
          height: 345,
          artSize: 233,
          rotation: 3.5,
          paddingTop: 16,
          paddingSide: 16,
          paddingBottom: 18,
          numberSize: 30,
          titleSize: 18,
          artistSize: 13,
          gap: 9,
          zIndex: 4,
        },
        {
          pos: 3,
          left: 745,
          top: 230,
          width: 255,
          height: 335,
          artSize: 223,
          rotation: -2.5,
          paddingTop: 16,
          paddingSide: 16,
          paddingBottom: 18,
          numberSize: 28,
          titleSize: 17,
          artistSize: 12,
          gap: 8,
          zIndex: 4,
        },
        {
          pos: 4,
          left: 650,
          top: 560,
          width: 265,
          height: 345,
          artSize: 233,
          rotation: 2.8,
          paddingTop: 16,
          paddingSide: 16,
          paddingBottom: 18,
          numberSize: 30,
          titleSize: 18,
          artistSize: 13,
          gap: 9,
          zIndex: 6,
        },
        {
          pos: 5,
          left: 285,
          top: 585,
          width: 260,
          height: 340,
          artSize: 228,
          rotation: -4.0,
          paddingTop: 16,
          paddingSide: 16,
          paddingBottom: 18,
          numberSize: 30,
          titleSize: 18,
          artistSize: 13,
          gap: 9,
          zIndex: 5,
        },
      ];

      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundColor: "#F7F7F7",
              color: "#0E0E0E",
              fontFamily: '"KHTeka", sans-serif',
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Concentric Palette Orbs */}
            {/* Upper Right Concentric Disc */}
            <div
              style={{
                position: "absolute",
                top: -110,
                right: -110,
                width: 440,
                height: 440,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 280,
                height: 280,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.65,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 40,
                right: 40,
                width: 140,
                height: 140,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Bottom Left Concentric Sphere */}
            <div
              style={{
                position: "absolute",
                bottom: -90,
                left: -90,
                width: 320,
                height: 320,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 190,
                height: 190,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.6,
              }}
            />

            {/* Header: Brand & Identity */}
            <div
              style={{
                position: "absolute",
                top: 48,
                left: 55,
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  lineHeight: 0.9,
                  color: "#0E0E0E",
                }}
              >
                musi5t
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "#0E0E0E",
                  opacity: 0.55,
                  fontWeight: 500,
                  marginTop: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                @{user.username}&apos;s definitive album rotation
              </span>
            </div>

            {/* 5 Polaroid Rotation Cards */}
            {squareCards.map((cfg) => {
              const album = userAlbums.find((a) => a.position === cfg.pos);
              const title = album ? album.title : `Slot 0${cfg.pos}`;
              const subtitle = album
                ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
                : "Uncurated";

              return (
                <div
                  key={cfg.pos}
                  style={{
                    position: "absolute",
                    left: cfg.left,
                    top: cfg.top,
                    width: cfg.width,
                    height: cfg.height,
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    paddingTop: cfg.paddingTop,
                    paddingLeft: cfg.paddingSide,
                    paddingRight: cfg.paddingSide,
                    paddingBottom: cfg.paddingBottom,
                    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.20)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    transform: `rotate(${cfg.rotation}deg)`,
                    zIndex: cfg.zIndex,
                  }}
                >
                  {/* Square Album Cover */}
                  <div
                    style={{
                      width: cfg.artSize,
                      height: cfg.artSize,
                      display: "flex",
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      backgroundColor: "#111111",
                    }}
                  >
                    {album?.coverDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverDataUrl}
                        alt={album.title}
                        width={cfg.artSize}
                        height={cfg.artSize}
                        style={{
                          width: cfg.artSize,
                          height: cfg.artSize,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: cfg.artSize,
                          height: cfg.artSize,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#111111",
                          color: "#FFFFFF",
                          fontSize: Math.round(cfg.artSize * 0.08),
                          fontWeight: 600,
                        }}
                      >
                        vinyl slot
                      </div>
                    )}
                  </div>

                  {/* Polaroid Chin: Number + Metadata */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                      width: cfg.artSize,
                      gap: cfg.gap,
                    }}
                  >
                    {/* Rank Number (Accent color for #1, solid black for 2-5) */}
                    <span
                      style={{
                        fontSize: cfg.numberSize,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: cfg.pos === 1 ? palette.accent : "#0E0E0E",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      0{cfg.pos}
                    </span>

                    {/* Title & Artist */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        flex: 1,
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: cfg.titleSize,
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#0E0E0E",
                        }}
                      >
                        {title}
                      </span>
                      <span
                        style={{
                          fontSize: cfg.artistSize,
                          color: "#0E0E0E",
                          opacity: 0.6,
                          fontWeight: 500,
                          lineHeight: 1.15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 55,
                right: 55,
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#0E0E0E",
                }}
              >
                Curated rotation by @{user.username}
              </span>
              <div
                style={{
                  width: "100%",
                  height: 2,
                  backgroundColor: "rgba(14, 14, 14, 0.12)",
                  marginTop: 14,
                  marginBottom: 10,
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  color: "#0E0E0E",
                  opacity: 0.5,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                musi5t.com/@{user.username}
              </span>
            </div>
          </div>
        ),
        { width, height, fonts }
      );
    }

    // 3. DEFAULT OG FORMAT (1200x630, Social Embeds)
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#F7F7F7",
            color: "#0E0E0E",
            padding: "45px 55px",
            fontFamily: '"KHTeka", sans-serif',
            position: "relative",
          }}
        >
          {/* Upper Right Concentric Disc */}
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 380,
              height: 380,
              borderRadius: "50%",
              backgroundColor: palette.secondaryOrb,
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 220,
              height: 220,
              borderRadius: "50%",
              backgroundColor: palette.accent,
              opacity: 0.65,
            }}
          />

          {/* Bottom Left Concentric Sphere */}
          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 300,
              height: 300,
              borderRadius: "50%",
              backgroundColor: palette.secondaryOrb,
              opacity: 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 170,
              height: 170,
              borderRadius: "50%",
              backgroundColor: palette.accent,
              opacity: 0.55,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: 84,
                fontWeight: 900,
                letterSpacing: "-0.06em",
                lineHeight: 0.9,
                color: "#0E0E0E",
              }}
            >
              musi5t
            </span>
            <span
              style={{
                fontSize: 20,
                color: "#0E0E0E",
                opacity: 0.55,
                fontWeight: 500,
                marginTop: 6,
              }}
            >
              @{user.username}&apos;s definitive album rotation
            </span>
          </div>

          {/* 5 Horizontal Shelf Columns */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              margin: "12px 0",
              zIndex: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((pos) => {
              const album = userAlbums.find((a) => a.position === pos);
              return (
                <div
                  key={pos}
                  style={{
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 200,
                      height: 200,
                      borderRadius: 16,
                      overflow: "hidden",
                      display: "flex",
                      border: "2px solid rgba(14, 14, 14, 0.08)",
                      backgroundColor: "#0E0E0E",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    {album?.coverDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverDataUrl}
                        alt={album.title}
                        width={200}
                        height={200}
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: 14,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 200,
                          height: 200,
                          backgroundColor: "#0E0E0E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F7F7F7",
                          fontSize: 18,
                        }}
                      >
                        vinyl
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor:
                          pos === 1
                            ? palette.accent
                            : "rgba(14, 14, 14, 0.88)",
                        color: pos === 1 ? (palette.textOnAccent || "#0E0E0E") : "#F7F7F7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      0{pos}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {album ? album.title : `Slot 0${pos}`}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: "#0E0E0E",
                      opacity: 0.6,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {album
                      ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
                      : "Uncurated"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              borderTop: "2px solid rgba(14, 14, 14, 0.1)",
              paddingTop: 16,
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "#0E0E0E",
                opacity: 0.5,
                fontWeight: 600,
              }}
            >
              musi5t.com/@{user.username}
            </span>
          </div>
        </div>
      ),
      { width, height, fonts }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Failed to generate Top 5 OG poster:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
