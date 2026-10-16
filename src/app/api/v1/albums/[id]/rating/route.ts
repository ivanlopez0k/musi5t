import { NextResponse, type NextRequest } from "next/server";
import { db, ensurePhase3Tables } from "@/db";
import { albumRatings, albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";

async function getAlbumRatingStats(albumId: string) {
  const [stats] = await db
    .select({
      averageScore: sql<string | null>`ROUND(AVG(${albumRatings.score})::numeric, 1)::text`,
      ratingsCount: sql<string>`COUNT(*)::text`,
    })
    .from(albumRatings)
    .where(eq(albumRatings.albumId, albumId));

  return {
    averageScore: stats?.averageScore ? parseFloat(stats.averageScore) : null,
    ratingsCount: stats?.ratingsCount ? parseInt(stats.ratingsCount, 10) : 0,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePhase3Tables();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: albumId } = await params;

    const [album] = await db
      .select({ id: albums.id })
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Álbum no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const score = Number(body.score);

    if (!Number.isInteger(score) || score < 1 || score > 10) {
      return NextResponse.json(
        { error: "El puntaje debe ser un número entero entre 1 y 10." },
        { status: 400 }
      );
    }

    await db
      .insert(albumRatings)
      .values({
        userId: user.id,
        albumId,
        score,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [albumRatings.userId, albumRatings.albumId],
        set: {
          score,
          updatedAt: new Date(),
        },
      });

    const stats = await getAlbumRatingStats(albumId);

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
    console.error("[rate album error]:", error);
    return NextResponse.json(
      { error: "Error al calificar el álbum." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePhase3Tables();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: albumId } = await params;

    await db
      .delete(albumRatings)
      .where(
        and(
          eq(albumRatings.userId, user.id),
          eq(albumRatings.albumId, albumId)
        )
      );

    const stats = await getAlbumRatingStats(albumId);

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
    console.error("[delete album rating error]:", error);
    return NextResponse.json(
      { error: "Error al eliminar la calificación del álbum." },
      { status: 500 }
    );
  }
}
