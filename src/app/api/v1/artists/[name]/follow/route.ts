import { NextResponse, type NextRequest } from "next/server";
import { db, ensureArtistTables } from "@/db";
import { artistFollows } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";

async function getFollowersCount(artistName: string): Promise<number> {
  const [stats] = await db
    .select({ count: sql<string>`COUNT(*)::text` })
    .from(artistFollows)
    .where(
      sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${artistName}))`
    );

  return stats?.count ? parseInt(stats.count, 10) : 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await ensureArtistTables();
    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    const user = await getCurrentUser(request);
    let isFollowing = false;

    if (user) {
      const [follow] = await db
        .select({ userId: artistFollows.userId })
        .from(artistFollows)
        .where(
          and(
            eq(artistFollows.userId, user.id),
            sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${decodedName}))`
          )
        )
        .limit(1);

      isFollowing = !!follow;
    }

    const followersCount = await getFollowersCount(decodedName);

    return NextResponse.json({
      isFollowing,
      followersCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get artist follow error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve artist follow status." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await ensureArtistTables();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    // Check if already following (case-insensitive)
    const [existing] = await db
      .select({ userId: artistFollows.userId, artistName: artistFollows.artistName })
      .from(artistFollows)
      .where(
        and(
          eq(artistFollows.userId, user.id),
          sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${decodedName}))`
        )
      )
      .limit(1);

    if (!existing) {
      await db
        .insert(artistFollows)
        .values({
          userId: user.id,
          artistName: decodedName,
        })
        .onConflictDoNothing();
    }

    const followersCount = await getFollowersCount(decodedName);

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followersCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[follow artist error]:", error);
    return NextResponse.json(
      { error: "Failed to follow artist." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await ensureArtistTables();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    await db
      .delete(artistFollows)
      .where(
        and(
          eq(artistFollows.userId, user.id),
          sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${decodedName}))`
        )
      );

    const followersCount = await getFollowersCount(decodedName);

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followersCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unfollow artist error]:", error);
    return NextResponse.json(
      { error: "Failed to unfollow artist." },
      { status: 500 }
    );
  }
}
