import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userTopAlbums, albums } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { getProfilePalette } from "@/lib/profile/palettes";

export const instant = false;

interface RouteProps {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { username: rawUsername } = await params;
    const username = decodeURIComponent(rawUsername).replace(/^@/, "").toLowerCase();
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "og"; // "story", "square", or "og"

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        themeKey: users.themeKey,
      })
      .from(users)
      .where(eq(sql`LOWER(${users.username})`, username))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const palette = getProfilePalette(user.themeKey);

    const userAlbums = await db
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
            {/* Ambient Background Graphic Disc */}
            <div
              style={{
                position: "absolute",
                top: -150,
                right: -150,
                width: 600,
                height: 600,
                borderRadius: "50%",
                backgroundColor: palette.secondaryOrb,
                opacity: 0.45,
              }}
            />

            {/* Header: Brand & Identity */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: palette.accent,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    musi5t
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 24px",
                    borderRadius: 999,
                    backgroundColor: "#0E0E0E",
                    color: "#F7F7F7",
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  TOP 5 CURATED
                </div>
              </div>

              {/* User Bio Header */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 15,
                }}
              >
                <span
                  style={{
                    fontSize: 68,
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
                    marginTop: 6,
                  }}
                >
                  @{user.username}&apos;s definitive vinyl rotation
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
                    {album?.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverUrl}
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
            padding: format === "square" ? "75px 60px" : "50px 60px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: palette.accent,
                }}
              />
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                musi5t
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>
                {user.displayName}
              </span>
              <span style={{ fontSize: 24, opacity: 0.5 }}>
                @{user.username}
              </span>
            </div>
          </div>

          {/* 5 Album Covers in Horizontal Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              margin: format === "square" ? "40px 0" : "20px 0",
              zIndex: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((pos) => {
              const album = userAlbums.find((a) => a.position === pos);
              const cardSize = format === "square" ? 175 : 190;
              return (
                <div
                  key={pos}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: cardSize,
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: cardSize,
                      height: cardSize,
                      borderRadius: 14,
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: "#0E0E0E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {album?.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        width={cardSize}
                        height={cardSize}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#F7F7F7", fontSize: 16 }}>
                        slot 0{pos}
                      </span>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: pos === 1 ? palette.accent : "rgba(0,0,0,0.8)",
                        color: pos === 1 ? "#0E0E0E" : "#FFF",
                        fontSize: 16,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      0{pos}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
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
                        opacity: 0.55,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {album ? album.artistName : "Uncurated"}
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
              borderTop: "1px solid rgba(14, 14, 14, 0.1)",
              paddingTop: 18,
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.5, fontWeight: 500 }}>
              Definitive Top 5 Records
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em" }}>
              MUSI5T.COM
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
