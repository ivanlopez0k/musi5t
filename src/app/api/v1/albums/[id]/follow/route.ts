import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { albumFollows, albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: albumId } = await params;

    // Verify album exists
    const [album] = await db
      .select({ id: albums.id })
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Álbum no encontrado." }, { status: 404 });
    }

    await db
      .insert(albumFollows)
      .values({
        userId: user.id,
        albumId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true, following: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[follow album error]:", error);
    return NextResponse.json(
      { error: "Error al seguir el álbum." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: albumId } = await params;

    await db
      .delete(albumFollows)
      .where(
        and(
          eq(albumFollows.userId, user.id),
          eq(albumFollows.albumId, albumId)
        )
      );

    return NextResponse.json({ success: true, following: false });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unfollow album error]:", error);
    return NextResponse.json(
      { error: "Error al dejar de seguir el álbum." },
      { status: 500 }
    );
  }
}
