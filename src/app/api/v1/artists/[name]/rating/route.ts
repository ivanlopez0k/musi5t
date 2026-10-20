import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artistRatings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";

async function getArtistRatingStats(artistName: string) {
  const [stats] = await db
    .select({
      averageScore: sql<string | null>`ROUND(AVG(${artistRatings.score})::numeric, 1)::text`,
      ratingsCount: sql<string>`COUNT(*)::text`,
    })
    .from(artistRatings)
    .where(
      sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${artistName}))`
    );

  return {
    averageScore: stats?.averageScore ? parseFloat(stats.averageScore) : null,
    ratingsCount: stats?.ratingsCount ? parseInt(stats.ratingsCount, 10) : 0,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    const user = await getCurrentUser(request);
    let userScore: number | null = null;

    if (user) {
      const [ratingRow] = await db
        .select({ score: artistRatings.score })
        .from(artistRatings)
        .where(
          and(
            eq(artistRatings.userId, user.id),
            sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${decodedName}))`
          )
        )
        .limit(1);

      if (ratingRow) {
        userScore = ratingRow.score;
      }
    }

    const stats = await getArtistRatingStats(decodedName);

    return NextResponse.json({
      userScore,
      averageScore: stats.averageScore,
      ratingsCount: stats.ratingsCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get artist rating error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve artist rating." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    const body = await request.json();
    const score = Number(body.score);

    if (!Number.isInteger(score) || score < 1 || score > 10) {
      return NextResponse.json(
        { error: "Score must be an integer between 1 and 10." },
        { status: 400 }
      );
    }

    // Check if rating exists for this user (case-insensitive)
    const [existing] = await db
      .select({
        userId: artistRatings.userId,
        artistName: artistRatings.artistName,
      })
      .from(artistRatings)
      .where(
        and(
          eq(artistRatings.userId, user.id),
          sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${decodedName}))`
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(artistRatings)
        .set({
          score,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(artistRatings.userId, user.id),
            eq(artistRatings.artistName, existing.artistName)
          )
        );
    } else {
      await db
        .insert(artistRatings)
        .values({
          userId: user.id,
          artistName: decodedName,
          score,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [artistRatings.userId, artistRatings.artistName],
          set: {
            score,
            updatedAt: new Date(),
          },
        });
    }

    const stats = await getArtistRatingStats(decodedName);

    return NextResponse.json({
      success: true,
      userScore: score,
      averageScore: stats.averageScore,
      ratingsCount: stats.ratingsCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[rate artist error]:", error);
    return NextResponse.json(
      { error: "Failed to rate artist." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    await db
      .delete(artistRatings)
      .where(
        and(
          eq(artistRatings.userId, user.id),
          sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${decodedName}))`
        )
      );

    const stats = await getArtistRatingStats(decodedName);

    return NextResponse.json({
      success: true,
      userScore: null,
      averageScore: stats.averageScore,
      ratingsCount: stats.ratingsCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete artist rating error]:", error);
    return NextResponse.json(
      { error: "Failed to remove artist rating." },
      { status: 500 }
    );
  }
}
