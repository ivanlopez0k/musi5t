import { db } from "@/db";
import { userLists, userListItems, users, albums } from "@/db/schema";
import { eq, inArray, sql, desc, and } from "drizzle-orm";

export interface ListAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  themeKey: string;
}

export interface ListPreviewItem {
  albumId: string;
  title: string;
  artistName: string;
  coverUrl: string;
  position: number;
}

export interface ListSummary {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: ListAuthor;
  itemCount: number;
  previewCovers: string[];
  previewItems: ListPreviewItem[];
}

export interface DetailedListItem {
  id: string;
  albumId: string;
  position: number;
  notes: string | null;
  coverUrl: string | null;
  createdAt: Date;
  album: {
    id: string;
    title: string;
    artistName: string;
    releaseYear: number | null;
    defaultCoverUrl: string | null;
  };
}

export interface DetailedList {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: ListAuthor;
  items: DetailedListItem[];
}

/**
 * Fetch list summaries with author details, item counts, and up to 4 album preview covers.
 */
export async function getListsFeed({
  limit = 20,
  offset = 0,
  searchQuery,
  userId,
  includePrivate = false,
}: {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  userId?: string;
  includePrivate?: boolean;
}): Promise<ListSummary[]> {
  const conditions = [];

  if (userId) {
    conditions.push(eq(userLists.userId, userId));
    if (!includePrivate) {
      conditions.push(eq(userLists.isPublic, true));
    }
  } else {
    conditions.push(eq(userLists.isPublic, true));
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = `%${searchQuery.trim().toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${userLists.title}) LIKE ${q} OR LOWER(COALESCE(${userLists.description}, '')) LIKE ${q})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rawLists = await db
    .select({
      id: userLists.id,
      title: userLists.title,
      description: userLists.description,
      isPublic: userLists.isPublic,
      createdAt: userLists.createdAt,
      updatedAt: userLists.updatedAt,
      authorId: users.id,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
      authorAvatarUrl: users.avatarUrl,
      authorThemeKey: users.themeKey,
    })
    .from(userLists)
    .innerJoin(users, eq(userLists.userId, users.id))
    .where(whereClause)
    .orderBy(desc(userLists.createdAt))
    .limit(limit)
    .offset(offset);

  if (rawLists.length === 0) {
    return [];
  }

  const listIds = rawLists.map((l) => l.id);

  // Fetch count of items per list
  const countRows = await db
    .select({
      listId: userListItems.listId,
      count: sql<number>`cast(count(${userListItems.id}) as integer)`,
    })
    .from(userListItems)
    .where(inArray(userListItems.listId, listIds))
    .groupBy(userListItems.listId);

  const countMap = new Map<string, number>();
  for (const row of countRows) {
    countMap.set(row.listId, row.count);
  }

  // Fetch first items per list for preview covers
  const previewItemsRows = await db
    .select({
      listId: userListItems.listId,
      albumId: userListItems.albumId,
      position: userListItems.position,
      customCoverUrl: userListItems.coverUrl,
      albumTitle: albums.title,
      albumArtistName: albums.artistName,
      albumDefaultCoverUrl: albums.defaultCoverUrl,
    })
    .from(userListItems)
    .innerJoin(albums, eq(userListItems.albumId, albums.id))
    .where(inArray(userListItems.listId, listIds))
    .orderBy(userListItems.position);

  const previewsMap = new Map<string, ListPreviewItem[]>();
  for (const item of previewItemsRows) {
    const listPreviews = previewsMap.get(item.listId) || [];
    if (listPreviews.length < 4) {
      const cover =
        item.customCoverUrl ||
        item.albumDefaultCoverUrl ||
        "/images/musi5t/vinyl_player.webp";

      listPreviews.push({
        albumId: item.albumId,
        title: item.albumTitle,
        artistName: item.albumArtistName,
        coverUrl: cover,
        position: item.position,
      });
      previewsMap.set(item.listId, listPreviews);
    }
  }

  return rawLists.map((l) => {
    const previews = previewsMap.get(l.id) || [];
    return {
      id: l.id,
      title: l.title,
      description: l.description,
      isPublic: l.isPublic,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      author: {
        id: l.authorId,
        username: l.authorUsername,
        displayName: l.authorDisplayName,
        avatarUrl: l.authorAvatarUrl,
        themeKey: l.authorThemeKey,
      },
      itemCount: countMap.get(l.id) || 0,
      previewCovers: previews.map((p) => p.coverUrl),
      previewItems: previews,
    };
  });
}

/**
 * Fetch a single detailed list with all items.
 */
export async function getDetailedListById(
  id: string,
  viewerUserId?: string | null
): Promise<{ list: DetailedList | null; isPrivateForbidden?: boolean }> {
  const [row] = await db
    .select({
      id: userLists.id,
      userId: userLists.userId,
      title: userLists.title,
      description: userLists.description,
      isPublic: userLists.isPublic,
      createdAt: userLists.createdAt,
      updatedAt: userLists.updatedAt,
      authorId: users.id,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
      authorAvatarUrl: users.avatarUrl,
      authorThemeKey: users.themeKey,
    })
    .from(userLists)
    .innerJoin(users, eq(userLists.userId, users.id))
    .where(eq(userLists.id, id))
    .limit(1);

  if (!row) {
    return { list: null };
  }

  if (!row.isPublic && (!viewerUserId || viewerUserId !== row.userId)) {
    return { list: null, isPrivateForbidden: true };
  }

  const itemsRows = await db
    .select({
      id: userListItems.id,
      albumId: userListItems.albumId,
      position: userListItems.position,
      notes: userListItems.notes,
      coverUrl: userListItems.coverUrl,
      createdAt: userListItems.createdAt,
      albumTitle: albums.title,
      albumArtistName: albums.artistName,
      albumReleaseYear: albums.releaseYear,
      albumDefaultCoverUrl: albums.defaultCoverUrl,
    })
    .from(userListItems)
    .innerJoin(albums, eq(userListItems.albumId, albums.id))
    .where(eq(userListItems.listId, id))
    .orderBy(userListItems.position);

  const items: DetailedListItem[] = itemsRows.map((it) => ({
    id: it.id,
    albumId: it.albumId,
    position: it.position,
    notes: it.notes,
    coverUrl: it.coverUrl || it.albumDefaultCoverUrl || "/images/musi5t/vinyl_player.webp",
    createdAt: it.createdAt,
    album: {
      id: it.albumId,
      title: it.albumTitle,
      artistName: it.albumArtistName,
      releaseYear: it.albumReleaseYear,
      defaultCoverUrl: it.albumDefaultCoverUrl,
    },
  }));

  return {
    list: {
      id: row.id,
      title: row.title,
      description: row.description,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId,
        username: row.authorUsername,
        displayName: row.authorDisplayName,
        avatarUrl: row.authorAvatarUrl,
        themeKey: row.authorThemeKey,
      },
      items,
    },
  };
}
