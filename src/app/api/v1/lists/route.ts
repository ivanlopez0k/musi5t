import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userLists, userListItems, albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getListsFeed } from "@/lib/lists/service";
import { inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
    const searchQuery = searchParams.get("q") || undefined;

    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 20;
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    const lists = await getListsFeed({
      limit,
      offset,
      searchQuery,
      includePrivate: false,
    });

    return NextResponse.json({ lists });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[lists feed error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists feed" },
      { status: 500 }
    );
  }
}

interface IncomingItem {
  albumId: string;
  position: number;
  notes?: string | null;
  coverUrl?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, isPublic = true, items } = body;

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
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

    // Validate description
    let trimmedDescription: string | null = null;
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return NextResponse.json(
          { error: "Description must be a string" },
          { status: 400 }
        );
      }
      trimmedDescription = description.trim();
      if (trimmedDescription.length > 1000) {
        return NextResponse.json(
          { error: "Description cannot exceed 1000 characters" },
          { status: 400 }
        );
      }
      if (trimmedDescription.length === 0) {
        trimmedDescription = null;
      }
    }

    // Validate items
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

    const incomingItems = items as IncomingItem[];
    const albumIds = incomingItems.map((it) => it.albumId).filter(Boolean);

    // Verify albums exist
    const existingAlbums = await db
      .select({ id: albums.id, defaultCoverUrl: albums.defaultCoverUrl })
      .from(albums)
      .where(inArray(albums.id, albumIds));

    const albumMap = new Map(existingAlbums.map((a) => [a.id, a]));

    for (const it of incomingItems) {
      if (!albumMap.has(it.albumId)) {
        return NextResponse.json(
          { error: `Album with id ${it.albumId} does not exist` },
          { status: 400 }
        );
      }
    }

    const isPub = typeof isPublic === "boolean" ? isPublic : true;

    // Insert list and list items atomically
    const createdList = await db.transaction(async (tx) => {
      const [newList] = await tx
        .insert(userLists)
        .values({
          userId: user.id,
          title: trimmedTitle,
          description: trimmedDescription,
          isPublic: isPub,
        })
        .returning();

      const itemsToInsert = incomingItems.map((it, idx) => {
        const foundAlbum = albumMap.get(it.albumId);
        const resolvedCover =
          it.coverUrl?.trim() ||
          foundAlbum?.defaultCoverUrl ||
          "/images/musi5t/vinyl_player.webp";

        return {
          listId: newList.id,
          albumId: it.albumId,
          position: typeof it.position === "number" ? it.position : idx + 1,
          notes: it.notes?.trim() || null,
          coverUrl: resolvedCover,
        };
      });

      await tx.insert(userListItems).values(itemsToInsert);

      return newList;
    });

    return NextResponse.json(
      {
        list: {
          id: createdList.id,
          title: createdList.title,
          description: createdList.description,
          isPublic: createdList.isPublic,
          createdAt: createdList.createdAt,
          updatedAt: createdList.updatedAt,
          author: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            themeKey: user.themeKey,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[create list error]:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
