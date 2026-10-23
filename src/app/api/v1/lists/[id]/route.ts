import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userLists, userListItems, albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getDetailedListById } from "@/lib/lists/service";
import { eq, inArray } from "drizzle-orm";

interface IncomingItem {
  albumId: string;
  position: number;
  notes?: string | null;
  coverUrl?: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser(request);
    const { list, isPrivateForbidden } = await getDetailedListById(id, currentUser?.id || null);

    if (isPrivateForbidden) {
      return NextResponse.json({ error: "This list is private" }, { status: 403 });
    }

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get list error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check list exists and ownership
    const [existingList] = await db
      .select()
      .from(userLists)
      .where(eq(userLists.id, id))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (existingList.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, isPublic, items } = body;

    const updates: {
      title?: string;
      description?: string | null;
      isPublic?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length > 100) {
        return NextResponse.json(
          { error: "Title cannot exceed 100 characters" },
          { status: 400 }
        );
      }
      updates.title = trimmedTitle;
    }

    if (description !== undefined) {
      if (description === null) {
        updates.description = null;
      } else if (typeof description === "string") {
        const trimmed = description.trim();
        if (trimmed.length > 1000) {
          return NextResponse.json(
            { error: "Description cannot exceed 1000 characters" },
            { status: 400 }
          );
        }
        updates.description = trimmed.length > 0 ? trimmed : null;
      } else {
        return NextResponse.json(
          { error: "Description must be a string or null" },
          { status: 400 }
        );
      }
    }

    if (isPublic !== undefined) {
      updates.isPublic = Boolean(isPublic);
    }

    // Process items if provided
    let incomingItems: IncomingItem[] | null = null;
    let albumMap = new Map<string, { id: string; defaultCoverUrl: string | null }>();

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "List must contain at least 1 album" },
          { status: 400 }
        );
      }
      if (items.length > 100) {
        return NextResponse.json(
          { error: "List cannot exceed 100 albums" },
          { status: 400 }
        );
      }

      incomingItems = items as IncomingItem[];
      const albumIds = incomingItems.map((it) => it.albumId).filter(Boolean);

      const existingAlbums = await db
        .select({ id: albums.id, defaultCoverUrl: albums.defaultCoverUrl })
        .from(albums)
        .where(inArray(albums.id, albumIds));

      albumMap = new Map(existingAlbums.map((a) => [a.id, a]));

      for (const it of incomingItems) {
        if (!albumMap.has(it.albumId)) {
          return NextResponse.json(
            { error: `Album with id ${it.albumId} does not exist` },
            { status: 400 }
          );
        }
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userLists)
        .set(updates)
        .where(eq(userLists.id, id));

      if (incomingItems) {
        // Delete existing items and insert new
        await tx
          .delete(userListItems)
          .where(eq(userListItems.listId, id));

        const itemsToInsert = incomingItems.map((it, idx) => {
          const foundAlbum = albumMap.get(it.albumId);
          const resolvedCover =
            it.coverUrl?.trim() ||
            foundAlbum?.defaultCoverUrl ||
            "/images/musi5t/vinyl_player.webp";

          return {
            listId: id,
            albumId: it.albumId,
            position: typeof it.position === "number" ? it.position : idx + 1,
            notes: it.notes?.trim() || null,
            coverUrl: resolvedCover,
          };
        });

        await tx.insert(userListItems).values(itemsToInsert);
      }
    });

    const { list: updatedList } = await getDetailedListById(id, currentUser.id);

    return NextResponse.json({ list: updatedList });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[update list error]:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [existingList] = await db
      .select({ id: userLists.id, userId: userLists.userId })
      .from(userLists)
      .where(eq(userLists.id, id))
      .limit(1);

    if (!existingList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (existingList.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(userLists).where(eq(userLists.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete list error]:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
