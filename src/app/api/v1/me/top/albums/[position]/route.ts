import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userTopAlbums, albums } from "@/db/schema";
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
    const { albumId, coverUrl, coverReleaseMbid } = body;

    if (!albumId) {
      return NextResponse.json(
        { error: "El identificador del álbum es requerido." },
        { status: 400 }
      );
    }

    // Verify album exists
    const [album] = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Álbum no encontrado." }, { status: 404 });
    }

    const finalCoverUrl = coverUrl || album.defaultCoverUrl || "/images/musi5t/vinyl_player.webp";

    // Run in a transaction: remove any duplicate of this album in user's top,
    // clear the target slot, and insert the new album
    await db.transaction(async (tx) => {
      // 1. Remove album from any other position in user's top
      await tx
        .delete(userTopAlbums)
        .where(
          and(
            eq(userTopAlbums.userId, user.id),
            eq(userTopAlbums.albumId, albumId)
          )
        );

      // 2. Remove whatever was in this position
      await tx
        .delete(userTopAlbums)
        .where(
          and(
            eq(userTopAlbums.userId, user.id),
            eq(userTopAlbums.position, pos)
          )
        );

      // 3. Insert into position
      await tx.insert(userTopAlbums).values({
        userId: user.id,
        albumId,
        position: pos,
        coverReleaseMbid: coverReleaseMbid || null,
        coverUrl: finalCoverUrl,
      });
    });

    return NextResponse.json({
      success: true,
      item: {
        position: pos,
        albumId,
        title: album.title,
        artistName: album.artistName,
        releaseYear: album.releaseYear,
        coverUrl: finalCoverUrl,
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[set top album error]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el Top 5 de álbumes." },
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
      .delete(userTopAlbums)
      .where(
        and(
          eq(userTopAlbums.userId, user.id),
          eq(userTopAlbums.position, pos)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete top album error]:", error);
    return NextResponse.json(
      { error: "Error al quitar el álbum del Top 5." },
      { status: 500 }
    );
  }
}
