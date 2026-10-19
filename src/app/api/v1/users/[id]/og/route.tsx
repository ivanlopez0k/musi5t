import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userTopAlbums, albums } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { getProfilePalette } from "@/lib/profile/palettes";

export const instant = false;

interface RouteProps {
  params: Promise<{ id: string }>;
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

    // 1. STORY FORMAT (1080x1920, 9:16)
    if (format === "story") {
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
              padding: "90px 75px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              position: "relative",
            }}
          >
            {/* DECORATIVE VISUAL LATERAL CIRCLES (Palette-Driven like Profile) */}
            {/* Upper Right Concentric Disc */}
            <div
              style={{
                position: "absolute",
                top: -160,
                right: -160,
                width: 620,
                height: 620,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 380,
                height: 380,
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
                width: 160,
                height: 160,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Left Edge Floating Satellite Circle */}
            <div
              style={{
                position: "absolute",
                top: 680,
                left: -90,
                width: 220,
                height: 220,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 720,
                left: -50,
                width: 140,
                height: 140,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.6,
              }}
            />

            {/* Right Edge Mid Graphic Dot */}
            <div
              style={{
                position: "absolute",
                top: 1220,
                right: -60,
                width: 180,
                height: 180,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Bottom Left Concentric Sphere */}
            <div
              style={{
                position: "absolute",
                bottom: -110,
                left: -110,
                width: 440,
                height: 440,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.45,
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
                opacity: 0.55,
              }}
            />

            {/* Header: Brand & Identity */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: palette.accent,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 64,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    musi5t
                  </span>
                </div>
              </div>

              {/* User Bio Header */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 72,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {user.displayName}
                </span>
                <span
                  style={{
                    fontSize: 32,
                    color: "#0E0E0E",
                    opacity: 0.55,
                    fontWeight: 500,
                    marginTop: 8,
                  }}
                >
                  @{user.username}&apos;s definitive album rotation
                </span>
              </div>
            </div>

            {/* 5 Albums Vertical List with Large Artwork */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                zIndex: 10,
                margin: "40px 0",
              }}
            >
              {[1, 2, 3, 4, 5].map((pos) => {
                const album = userAlbums.find((a) => a.position === pos);
                return (
                  <div
                    key={pos}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "2px solid rgba(14, 14, 14, 0.08)",
                      borderRadius: 24,
                      padding: "18px 24px",
                      gap: 28,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 58,
                        height: 58,
                        borderRadius: 14,
                        backgroundColor: pos === 1 ? palette.accent : "#0E0E0E",
                        color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
                        fontSize: 28,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      0{pos}
                    </div>

                    {/* Album Cover */}
                    {album?.coverDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverDataUrl}
                        alt={album.title}
                        width={140}
                        height={140}
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: 16,
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: 16,
                          backgroundColor: "#0E0E0E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F7F7F7",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        vinyl slot
                      </div>
                    )}

                    {/* Metadata */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 34,
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {album ? album.title : `Slot 0${pos} uncurated`}
                      </span>
                      <span
                        style={{
                          fontSize: 26,
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
                          : "Empty vinyl slot"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "2px solid rgba(14, 14, 14, 0.1)",
                paddingTop: 30,
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  color: "#0E0E0E",
                  opacity: 0.5,
                  fontWeight: 600,
                }}
              >
                musi5t.com/@{user.username}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#0E0E0E",
                }}
              >
                ALBUM-FIRST SOCIAL
              </span>
            </div>
          </div>
        ),
        { width, height }
      );
    }

    // 2. SQUARE (1080x1080) & OG (1200x630) FORMAT
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
            padding: "50px 60px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* DECORATIVE VISUAL LATERAL CIRCLES (Palette-Driven like Profile) */}
          {/* Upper Right Concentric Disc */}
          <div
            style={{
              position: "absolute",
              top: -130,
              right: -130,
              width: 480,
              height: 480,
              borderRadius: "50%",
              backgroundColor: palette.secondaryOrb,
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 290,
              height: 290,
              borderRadius: "50%",
              backgroundColor: palette.accent,
              opacity: 0.65,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: palette.softGlow,
              opacity: 0.45,
            }}
          />

          {/* Left Edge Satellite Circle */}
          <div
            style={{
              position: "absolute",
              top: 420,
              left: -60,
              width: 160,
              height: 160,
              borderRadius: "50%",
              backgroundColor: palette.accent,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 450,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: palette.secondaryOrb,
              opacity: 0.6,
            }}
          />

          {/* Right Lower Graphic Dot */}
          <div
            style={{
              position: "absolute",
              bottom: 140,
              right: -40,
              width: 130,
              height: 130,
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
              width: 340,
              height: 340,
              borderRadius: "50%",
              backgroundColor: palette.secondaryOrb,
              opacity: 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -25,
              left: -25,
              width: 190,
              height: 190,
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
              gap: 12,
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: palette.accent,
                  }}
                />
                <span
                  style={{
                    fontSize: 54,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                  }}
                >
                  musi5t
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {user.displayName}
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "#0E0E0E",
                  opacity: 0.55,
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                @{user.username}&apos;s definitive album rotation
              </span>
            </div>
          </div>

          {/* 5 Albums Vertical List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              zIndex: 10,
              margin: "16px 0",
            }}
          >
            {[1, 2, 3, 4, 5].map((pos) => {
              const album = userAlbums.find((a) => a.position === pos);
              return (
                <div
                  key={pos}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    border: "2px solid rgba(14, 14, 14, 0.08)",
                    borderRadius: 16,
                    padding: "10px 18px",
                    gap: 20,
                  }}
                >
                  {/* Rank Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: pos === 1 ? palette.accent : "#0E0E0E",
                      color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
                      fontSize: 22,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    0{pos}
                  </div>

                  {/* Album Cover */}
                  {album?.coverDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverDataUrl}
                      alt={album.title}
                      width={88}
                      height={88}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 12,
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 12,
                        backgroundColor: "#0E0E0E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F7F7F7",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      vinyl
                    </div>
                  )}

                  {/* Metadata */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {album ? album.title : `Slot 0${pos} uncurated`}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
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
                        : "Empty vinyl slot"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid rgba(14, 14, 14, 0.1)",
              paddingTop: 16,
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: "#0E0E0E",
                opacity: 0.5,
                fontWeight: 600,
              }}
            >
              musi5t.com/@{user.username}
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#0E0E0E",
              }}
            >
              ALBUM-FIRST SOCIAL
            </span>
          </div>
        </div>
      ),
      { width, height }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Failed to generate Top 5 OG poster:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
