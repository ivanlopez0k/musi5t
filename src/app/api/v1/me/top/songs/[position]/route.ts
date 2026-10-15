import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userTopSongs, songs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ position: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { position } = await params;
    const pos = parseInt(position, 10);
    if (isNaN(pos) || pos < 1 || pos > 5) {
      return NextResponse.json(
        { error: "La posición debe estar entre 1 y 5." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { songId } = body;

    if (!songId) {
      return NextResponse.json(
        { error: "El identificador de la canción es requerido." },
        { status: 400 }
      );
    }

    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, songId))
      .limit(1);

    if (!song) {
      return NextResponse.json({ error: "Canción no encontrada." }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // 1. Remove song from other positions
      await tx
        .delete(userTopSongs)
        .where(
          and(
            eq(userTopSongs.userId, user.id),
            eq(userTopSongs.songId, songId)
          )
        );

      // 2. Remove whatever was in this position
      await tx
        .delete(userTopSongs)
        .where(
          and(
            eq(userTopSongs.userId, user.id),
            eq(userTopSongs.position, pos)
          )
        );

      // 3. Insert into position
      await tx.insert(userTopSongs).values({
        userId: user.id,
        songId,
        position: pos,
      });
    });

    return NextResponse.json({
      success: true,
      item: {
        position: pos,
        songId,
        title: song.title,
        artistName: song.artistName,
        coverUrl: song.coverUrl,
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[set top song error]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el Top 5 de canciones." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ position: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { position } = await params;
    const pos = parseInt(position, 10);
    if (isNaN(pos) || pos < 1 || pos > 5) {
      return NextResponse.json(
        { error: "La posición debe estar entre 1 y 5." },
        { status: 400 }
      );
    }

    await db
      .delete(userTopSongs)
      .where(
        and(
          eq(userTopSongs.userId, user.id),
          eq(userTopSongs.position, pos)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete top song error]:", error);
    return NextResponse.json(
      { error: "Error al quitar la canción del Top 5." },
      { status: 500 }
    );
  }
}
