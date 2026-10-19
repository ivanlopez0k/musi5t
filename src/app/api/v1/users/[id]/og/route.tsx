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
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
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
                  marginTop: 10,
                }}
              >
                @{user.username}&apos;s definitive album rotation
              </span>
            </div>

            {/* 5 Albums Vertical List with Large Artwork */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 32,
                zIndex: 10,
                margin: "12px 0",
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
                      backgroundColor: "rgba(255, 255, 255, 0.88)",
                      border: "2px solid rgba(14, 14, 14, 0.08)",
                      borderRadius: 26,
                      padding: "24px 30px",
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
                        width: 70,
                        height: 70,
                        borderRadius: 18,
                        backgroundColor: pos === 1 ? palette.accent : "#0E0E0E",
                        color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
                        fontSize: 32,
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
                        width={185}
                        height={185}
                        style={{
                          width: 185,
                          height: 185,
                          borderRadius: 20,
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 185,
                          height: 185,
                          borderRadius: 20,
                          backgroundColor: "#0E0E0E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F7F7F7",
                          fontSize: 22,
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
                        gap: 8,
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 40,
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
                          fontSize: 28,
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

            {/* Curator text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#0E0E0E",
                }}
              >
                Curated rotation by @{user.username}
              </span>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                borderTop: "2px solid rgba(14, 14, 14, 0.12)",
                paddingTop: 32,
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 28,
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
        { width, height }
      );
    }

    // 2. SQUARE FORMAT (1080x1080, 1:1)
    if (format === "square") {
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
              padding: "75px 65px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              position: "relative",
            }}
          >
            {/* Decorative Concentric Lateral Circles */}
            {/* Upper Right Concentric Disc */}
            <div
              style={{
                position: "absolute",
                top: -140,
                right: -140,
                width: 520,
                height: 520,
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
                width: 320,
                height: 320,
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
                width: 140,
                height: 140,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Left Edge Satellite Circle */}
            <div
              style={{
                position: "absolute",
                top: 480,
                left: -70,
                width: 190,
                height: 190,
                borderRadius: "50%",
                backgroundColor: palette.accent,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 510,
                left: -40,
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.6,
              }}
            />

            {/* Right Lower Graphic Dot */}
            <div
              style={{
                position: "absolute",
                bottom: 200,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: "50%",
                backgroundColor: palette.softGlow,
                opacity: 0.45,
              }}
            />

            {/* Bottom Left Concentric Sphere */}
            <div
              style={{
                position: "absolute",
                bottom: -100,
                left: -100,
                width: 380,
                height: 380,
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
                width: 220,
                height: 220,
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
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 84,
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: "#0E0E0E",
                }}
              >
                musi5t
              </span>
              <span
                style={{
                  fontSize: 26,
                  color: "#0E0E0E",
                  opacity: 0.55,
                  fontWeight: 500,
                  marginTop: 8,
                }}
              >
                @{user.username}&apos;s definitive album rotation
              </span>
            </div>

            {/* Middle: 5 Horizontal Album Shelf Showcase */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                zIndex: 10,
              }}
            >
              {/* 5 Columns Shelf */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                {[1, 2, 3, 4, 5].map((pos) => {
                  const album = userAlbums.find((a) => a.position === pos);
                  return (
                    <div
                      key={pos}
                      style={{
                        width: 176,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Album Cover Card with Corner Rank Badge */}
                      <div
                        style={{
                          position: "relative",
                          width: 176,
                          height: 176,
                          borderRadius: 18,
                          overflow: "hidden",
                          display: "flex",
                          border: "2px solid rgba(14, 14, 14, 0.08)",
                          backgroundColor: "#0E0E0E",
                          boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
                        }}
                      >
                        {album?.coverDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.coverDataUrl}
                            alt={album.title}
                            width={176}
                            height={176}
                            style={{
                              width: 176,
                              height: 176,
                              borderRadius: 16,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 176,
                              height: 176,
                              backgroundColor: "#0E0E0E",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F7F7F7",
                              fontSize: 18,
                            }}
                          >
                            vinyl slot
                          </div>
                        )}

                        {/* Corner Rank Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor:
                              pos === 1
                                ? palette.accent
                                : "rgba(14, 14, 14, 0.88)",
                            color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: 800,
                          }}
                        >
                          0{pos}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          overflow: "hidden",
                          width: 176,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 22,
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
                            : "Uncurated"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Editorial Shelf Pedestal Line */}
              <div
                style={{
                  width: "100%",
                  height: 3,
                  backgroundColor: "rgba(14, 14, 14, 0.12)",
                  borderRadius: 2,
                  marginTop: 22,
                }}
              />

              {/* Curator text */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  marginTop: 22,
                }}
              >
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#0E0E0E",
                  }}
                >
                  Curated rotation by @{user.username}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                borderTop: "2px solid rgba(14, 14, 14, 0.12)",
                paddingTop: 24,
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 24,
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
        { width, height }
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
            fontFamily: "system-ui, -apple-system, sans-serif",
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
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 1,
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
                        color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
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
