import { db, ensurePhase3Tables } from "@/db";
import { sql } from "drizzle-orm";

export interface FeedPost {
  id: string;
  body: string;
  isPublic: boolean;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    themeKey: string;
  };
  albums: {
    id: string;
    title: string;
    artistName: string;
    defaultCoverUrl: string | null;
  }[];
  likesCount: number;
  likedByMe: boolean;
  repliesCount: number;
}

interface RawPostRow {
  id: string;
  body: string;
  is_public: boolean;
  created_at: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string | null;
  author_theme_key: string;
  likes_count: string;
  liked_by_me: boolean;
  replies_count: string;
  albums_json: string | null;
  [key: string]: unknown;
}

function mapRawPostRows(rows: RawPostRow[]): FeedPost[] {
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    isPublic: r.is_public,
    createdAt: new Date(r.created_at),
    author: {
      id: r.author_id,
      username: r.author_username,
      displayName: r.author_display_name,
      avatarUrl: r.author_avatar_url,
      themeKey: r.author_theme_key,
    },
    albums: r.albums_json
      ? typeof r.albums_json === "string"
        ? JSON.parse(r.albums_json)
        : (r.albums_json as FeedPost["albums"])
      : [],
    likesCount: parseInt(r.likes_count, 10) || 0,
    likedByMe: Boolean(r.liked_by_me),
    repliesCount: parseInt(r.replies_count, 10) || 0,
  }));
}

export async function getFeedPosts({
  userId,
  type = "for-you",
  cursor,
  limit = 20,
}: {
  userId?: string | null;
  type?: "for-you" | "global";
  cursor?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  await ensurePhase3Tables();
  const me = userId || null;
  const cursorDate = cursor ? new Date(cursor) : null;

  // Build the query matching Section 7 of SDD
  const rows = await db.execute<RawPostRow>(sql`
    SELECT 
      p.id,
      p.body,
      p.is_public,
      p.created_at,
      u.id AS author_id,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url,
      u.theme_key AS author_theme_key,
      COUNT(DISTINCT pl.user_id)::text AS likes_count,
      CASE 
        WHEN ${me}::uuid IS NOT NULL THEN 
          EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${me}::uuid)
        ELSE false
      END AS liked_by_me,
      COUNT(DISTINCT pr.id)::text AS replies_count,
      (
        SELECT json_agg(json_build_object(
          'id', a.id,
          'title', a.title,
          'artistName', a.artist_name,
          'defaultCoverUrl', a.default_cover_url
        ))
        FROM post_albums pa
        JOIN albums a ON a.id = pa.album_id
        WHERE pa.post_id = p.id
      ) AS albums_json
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    LEFT JOIN post_replies pr ON pr.post_id = p.id AND pr.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
      ${
        me
          ? sql`
            AND NOT EXISTS (
              SELECT 1 FROM blocks b
              WHERE (b.blocker_id = ${me}::uuid AND b.blocked_id = p.author_id)
                 OR (b.blocker_id = p.author_id AND b.blocked_id = ${me}::uuid)
            )
            AND NOT EXISTS (
              SELECT 1 FROM mutes m
              WHERE m.muter_id = ${me}::uuid AND m.muted_id = p.author_id
            )
          `
          : sql``
      }
      ${
        type === "global" || !me
          ? sql`AND p.is_public = true`
          : sql`
            AND (
              p.author_id = ${me}::uuid
              OR EXISTS (
                SELECT 1 FROM follows f
                WHERE f.follower_id = ${me}::uuid AND f.followee_id = p.author_id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN user_top_albums t ON t.album_id = pa.album_id AND t.user_id = ${me}::uuid
                WHERE pa.post_id = p.id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN album_follows af ON af.album_id = pa.album_id AND af.user_id = ${me}::uuid
                WHERE pa.post_id = p.id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN albums a ON a.id = pa.album_id
                JOIN artist_follows art_f ON art_f.user_id = ${me}::uuid 
                  AND LOWER(TRIM(a.artist_name)) = LOWER(TRIM(art_f.artist_name))
                WHERE pa.post_id = p.id
              )
            )
          `
      }
      ${cursorDate ? sql`AND p.created_at < ${cursorDate}` : sql``}
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit};
  `);

  return mapRawPostRows(rows);
}

export async function getUserVisiblePosts({
  profileUserId,
  viewerUserId,
  limit = 20,
}: {
  profileUserId: string;
  viewerUserId?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  await ensurePhase3Tables();
  const me = viewerUserId || null;

  const rows = await db.execute<RawPostRow>(sql`
    SELECT 
      p.id,
      p.body,
      p.is_public,
      p.created_at,
      u.id AS author_id,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url,
      u.theme_key AS author_theme_key,
      COUNT(DISTINCT pl.user_id)::text AS likes_count,
      CASE 
        WHEN ${me}::uuid IS NOT NULL THEN 
          EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${me}::uuid)
        ELSE false
      END AS liked_by_me,
      COUNT(DISTINCT pr.id)::text AS replies_count,
      (
        SELECT json_agg(json_build_object(
          'id', a.id,
          'title', a.title,
          'artistName', a.artist_name,
          'defaultCoverUrl', a.default_cover_url
        ))
        FROM post_albums pa
        JOIN albums a ON a.id = pa.album_id
        WHERE pa.post_id = p.id
      ) AS albums_json
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    LEFT JOIN post_replies pr ON pr.post_id = p.id AND pr.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
      AND p.author_id = ${profileUserId}::uuid
      ${
        me
          ? sql`
            AND NOT EXISTS (
              SELECT 1 FROM blocks b
              WHERE (b.blocker_id = ${me}::uuid AND b.blocked_id = p.author_id)
                 OR (b.blocker_id = p.author_id AND b.blocked_id = ${me}::uuid)
            )
            AND (
              p.is_public = true
              OR p.author_id = ${me}::uuid
              OR EXISTS (
                SELECT 1 FROM follows f
                WHERE f.follower_id = ${me}::uuid AND f.followee_id = p.author_id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN user_top_albums t ON t.album_id = pa.album_id AND t.user_id = ${me}::uuid
                WHERE pa.post_id = p.id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN album_follows af ON af.album_id = pa.album_id AND af.user_id = ${me}::uuid
                WHERE pa.post_id = p.id
              )
              OR EXISTS (
                SELECT 1 FROM post_albums pa
                JOIN albums a ON a.id = pa.album_id
                JOIN artist_follows art_f ON art_f.user_id = ${me}::uuid 
                  AND LOWER(TRIM(a.artist_name)) = LOWER(TRIM(art_f.artist_name))
                WHERE pa.post_id = p.id
              )
            )
          `
          : sql`AND p.is_public = true`
      }
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit};
  `);

  return mapRawPostRows(rows);
}

export async function getArtistVisiblePosts({
  artistName,
  viewerUserId,
  limit = 20,
}: {
  artistName: string;
  viewerUserId?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  await ensurePhase3Tables();
  const me = viewerUserId || null;

  const rows = await db.execute<RawPostRow>(sql`
    SELECT 
      p.id,
      p.body,
      p.is_public,
      p.created_at,
      u.id AS author_id,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url,
      u.theme_key AS author_theme_key,
      COUNT(DISTINCT pl.user_id)::text AS likes_count,
      CASE 
        WHEN ${me}::uuid IS NOT NULL THEN 
          EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${me}::uuid)
        ELSE false
      END AS liked_by_me,
      COUNT(DISTINCT pr.id)::text AS replies_count,
      (
        SELECT json_agg(json_build_object(
          'id', a.id,
          'title', a.title,
          'artistName', a.artist_name,
          'defaultCoverUrl', a.default_cover_url
        ))
        FROM post_albums pa2
        JOIN albums a ON a.id = pa2.album_id
        WHERE pa2.post_id = p.id
      ) AS albums_json
    FROM post_albums pa
    JOIN albums a_filter ON a_filter.id = pa.album_id
    JOIN posts p ON p.id = pa.post_id
    JOIN users u ON u.id = p.author_id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    LEFT JOIN post_replies pr ON pr.post_id = p.id AND pr.deleted_at IS NULL
    WHERE LOWER(TRIM(a_filter.artist_name)) = LOWER(TRIM(${artistName}))
      AND p.deleted_at IS NULL
      ${
        me
          ? sql`
            AND NOT EXISTS (
              SELECT 1 FROM blocks b
              WHERE (b.blocker_id = ${me}::uuid AND b.blocked_id = p.author_id)
                 OR (b.blocker_id = p.author_id AND b.blocked_id = ${me}::uuid)
            )
            AND NOT EXISTS (
              SELECT 1 FROM mutes m
              WHERE m.muter_id = ${me}::uuid AND m.muted_id = p.author_id
            )
          `
          : sql``
      }
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit};
  `);

  return mapRawPostRows(rows);
}

export async function getAlbumVisiblePosts({
  albumId,
  viewerUserId,
  limit = 20,
}: {
  albumId: string;
  viewerUserId?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  await ensurePhase3Tables();
  const me = viewerUserId || null;

  const rows = await db.execute<RawPostRow>(sql`
    SELECT 
      p.id,
      p.body,
      p.is_public,
      p.created_at,
      u.id AS author_id,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url,
      u.theme_key AS author_theme_key,
      COUNT(DISTINCT pl.user_id)::text AS likes_count,
      CASE 
        WHEN ${me}::uuid IS NOT NULL THEN 
          EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${me}::uuid)
        ELSE false
      END AS liked_by_me,
      COUNT(DISTINCT pr.id)::text AS replies_count,
      (
        SELECT json_agg(json_build_object(
          'id', a.id,
          'title', a.title,
          'artistName', a.artist_name,
          'defaultCoverUrl', a.default_cover_url
        ))
        FROM post_albums pa2
        JOIN albums a ON a.id = pa2.album_id
        WHERE pa2.post_id = p.id
      ) AS albums_json
    FROM post_albums pa
    JOIN posts p ON p.id = pa.post_id
    JOIN users u ON u.id = p.author_id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    LEFT JOIN post_replies pr ON pr.post_id = p.id AND pr.deleted_at IS NULL
    WHERE pa.album_id = ${albumId}::uuid
      AND p.deleted_at IS NULL
      ${
        me
          ? sql`
            AND NOT EXISTS (
              SELECT 1 FROM blocks b
              WHERE (b.blocker_id = ${me}::uuid AND b.blocked_id = p.author_id)
                 OR (b.blocker_id = p.author_id AND b.blocked_id = ${me}::uuid)
            )
            AND NOT EXISTS (
              SELECT 1 FROM mutes m
              WHERE m.muter_id = ${me}::uuid AND m.muted_id = p.author_id
            )
          `
          : sql``
      }
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit};
  `);

  return mapRawPostRows(rows);
}

