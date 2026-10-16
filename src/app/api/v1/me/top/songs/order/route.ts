import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userTopSongs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { asc, eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { fromPosition, toPosition, orderedIds, orderedSongIds } = body;

    const currentItems = await db
      .select()
      .from(userTopSongs)
      .where(eq(userTopSongs.userId, user.id))
      .orderBy(asc(userTopSongs.position));

    if (currentItems.length === 0) {
      return NextResponse.json({ success: true });
    }

    const nextItems = currentItems.map((item) => ({ ...item }));

    if (
      typeof fromPosition === "number" &&
      typeof toPosition === "number" &&
      fromPosition >= 1 &&
      fromPosition <= 5 &&
      toPosition >= 1 &&
      toPosition <= 5
    ) {
      if (fromPosition === toPosition) {
        return NextResponse.json({ success: true });
      }
      const fromItem = nextItems.find((i) => i.position === fromPosition);
      const toItem = nextItems.find((i) => i.position === toPosition);

      if (!fromItem) {
        return NextResponse.json(
          { error: "No hay ninguna canción en la posición de origen." },
          { status: 400 }
        );
      }

      fromItem.position = toPosition;
      if (toItem) {
        toItem.position = fromPosition;
      }
    } else if (Array.isArray(orderedIds || orderedSongIds)) {
      const idList: string[] = orderedIds || orderedSongIds;
      for (let idx = 0; idx < idList.length && idx < 5; idx++) {
        const target = nextItems.find(
          (i) => i.id === idList[idx] || i.songId === idList[idx]
        );
        if (target) {
          target.position = idx + 1;
        }
      }
    } else {
      return NextResponse.json(
        { error: "Parámetros de ordenamiento inválidos." },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(userTopSongs).where(eq(userTopSongs.userId, user.id));
      await tx.insert(userTopSongs).values(
        nextItems.map((item) => ({
          id: item.id,
          userId: item.userId,
          songId: item.songId,
          position: item.position,
          createdAt: item.createdAt,
        }))
      );
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[reorder top songs error]:", error);
    return NextResponse.json(
      { error: "Error al reordenar el Top 5 de canciones." },
      { status: 500 }
    );
  }
}
