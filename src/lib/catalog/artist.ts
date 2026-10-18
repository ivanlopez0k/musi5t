import { db, ensureArtistTables } from "@/db";
import { albums, albumRatings, artistRatings, artistFollows } from "@/db/schema";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import {
  cleanDisplayAlbumTitle,
  getCanonicalAlbumMbid,
  normalizeAlbumTitle,
  normalizeText,
} from "./musicbrainz";

export interface ArtistAlbumItem {
  id: string;
  title: string;
  artistName: string;
  releaseYear: number | null;
  defaultCoverUrl: string | null;
  averageScore: number | null;
  ratingsCount: number;
}

export interface ArtistData {
  name: string;
  pictureUrl: string | null;
  nbFans: number;
  followersCount: number;
  isFollowing: boolean;
  averageScore: number | null;
  ratingsCount: number;
  userScore: number | null;
  careerSpan: string | null;
  albums: ArtistAlbumItem[];
}

interface DeezerArtistSearchResponse {
  data?: Array<{
    id: number;
    name: string;
    picture?: string;
    picture_small?: string;
    picture_medium?: string;
    picture_big?: string;
    picture_xl?: string;
    nb_album?: number;
    nb_fan?: number;
  }>;
  total?: number;
}

interface DeezerArtistAlbumsResponse {
  data?: Array<{
    id: number;
    title: string;
    cover?: string;
    cover_small?: string;
    cover_medium?: string;
    cover_big?: string;
    cover_xl?: string;
    release_date?: string;
    record_type?: string;
  }>;
}

/**
 * Retrieves comprehensive artist details including discography, ratings, followers,
 * Deezer metadata, and community stats.
 */
export async function getArtistData(
  artistName: string,
  viewerUserId?: string | null
): Promise<ArtistData> {
  await ensureArtistTables();

  const cleanArtistName = decodeURIComponent(artistName).trim();
  const normalizedArtist = normalizeText(cleanArtistName);

  // 1. In parallel: Fetch Deezer metadata & query local albums
  const [deezerRes, localAlbumsRaw] = await Promise.allSettled([
    fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(cleanArtistName)}`,
      { next: { revalidate: 86400 } }
    ).then(async (res) => {
      if (!res.ok) return null;
      const data: DeezerArtistSearchResponse = await res.json();
      if (!Array.isArray(data.data) || data.data.length === 0) return null;
      return (
        data.data.find(
          (a) => normalizeText(a.name) === normalizedArtist
        ) || data.data[0]
      );
    }),
    db
      .select({
        id: albums.id,
        title: albums.title,
        artistName: albums.artistName,
        releaseYear: albums.releaseYear,
        defaultCoverUrl: albums.defaultCoverUrl,
      })
      .from(albums)
      .where(
        sql`LOWER(TRIM(${albums.artistName})) = LOWER(TRIM(${cleanArtistName}))`
      )
      .orderBy(sql`${albums.releaseYear} ASC NULLS LAST`),
  ]);

  const deezerArtist =
    deezerRes.status === "fulfilled" ? deezerRes.value : null;
  let localAlbums =
    localAlbumsRaw.status === "fulfilled" ? localAlbumsRaw.value : [];

  // Canonical display artist name from Deezer if matched
  const displayName =
    deezerArtist?.name && normalizeText(deezerArtist.name) === normalizedArtist
      ? deezerArtist.name
      : cleanArtistName;

  // 2. Fetch official discography from Deezer if artist was found
  if (deezerArtist?.id) {
    try {
      const albumsRes = await fetch(
        `https://api.deezer.com/artist/${deezerArtist.id}/albums?limit=100`,
        { next: { revalidate: 86400 } }
      );

      if (albumsRes.ok) {
        const albumsJson: DeezerArtistAlbumsResponse = await albumsRes.json();
        const rawItems = Array.isArray(albumsJson.data) ? albumsJson.data : [];

        // Deduplicate & canonicalize by title
        const grouped = new Map<
          string,
          {
            cleanTitle: string;
            year: number | null;
            coverUrl: string;
          }
        >();

        for (const item of rawItems) {
          if (!item.title) continue;
          if (item.record_type === "single") continue;

          const rawTitle = item.title.trim();
          const cleanTitle = cleanDisplayAlbumTitle(rawTitle);
          const titleKey = normalizeAlbumTitle(cleanTitle);

          const year = item.release_date
            ? parseInt(item.release_date.slice(0, 4), 10)
            : null;
          const validYear = year && !Number.isNaN(year) ? year : null;
          const coverUrl =
            item.cover_xl ||
            item.cover_big ||
            item.cover_medium ||
            item.cover ||
            "/images/musi5t/vinyl_player.webp";

          if (!grouped.has(titleKey)) {
            grouped.set(titleKey, { cleanTitle, year: validYear, coverUrl });
          } else {
            const existing = grouped.get(titleKey)!;
            const earliestYear =
              existing.year && validYear
                ? Math.min(existing.year, validYear)
                : existing.year ?? validYear;
            existing.year = earliestYear;
            if (coverUrl.includes("cover_xl")) {
              existing.coverUrl = coverUrl;
            }
          }
        }

        // Identify which albums from Deezer are not yet in localAlbums
        const existingTitleKeys = new Set(
          localAlbums.map((a) => normalizeAlbumTitle(a.title))
        );

        const newAlbumsToInsert = [];
        for (const [key, item] of grouped.entries()) {
          if (!existingTitleKeys.has(key)) {
            const mbid = getCanonicalAlbumMbid(displayName, item.cleanTitle);
            newAlbumsToInsert.push({
              mbid,
              title: item.cleanTitle,
              artistName: displayName,
              releaseYear: item.year,
              defaultCoverUrl: item.coverUrl,
            });
          }
        }

        // Batch insert missing albums
        if (newAlbumsToInsert.length > 0) {
          await db
            .insert(albums)
            .values(newAlbumsToInsert)
            .onConflictDoNothing();

          // Re-query local albums with enriched records
          localAlbums = await db
            .select({
              id: albums.id,
              title: albums.title,
              artistName: albums.artistName,
              releaseYear: albums.releaseYear,
              defaultCoverUrl: albums.defaultCoverUrl,
            })
            .from(albums)
            .where(
              or(
                sql`LOWER(TRIM(${albums.artistName})) = LOWER(TRIM(${cleanArtistName}))`,
                sql`LOWER(TRIM(${albums.artistName})) = LOWER(TRIM(${displayName}))`
              )
            )
            .orderBy(sql`${albums.releaseYear} ASC NULLS LAST`);
        }
      }
    } catch (err) {
      console.error("[getArtistData deezer albums enrich error]:", err);
    }
  }

  // Deduplicate local albums by normalized title
  const uniqueAlbumsMap = new Map<string, typeof localAlbums[number]>();
  for (const album of localAlbums) {
    const key = normalizeAlbumTitle(album.title);
    if (!uniqueAlbumsMap.has(key)) {
      uniqueAlbumsMap.set(key, album);
    } else {
      const existing = uniqueAlbumsMap.get(key)!;
      if (!existing.releaseYear && album.releaseYear) {
        uniqueAlbumsMap.set(key, album);
      }
    }
  }
  const deduplicatedAlbums = Array.from(uniqueAlbumsMap.values()).sort((a, b) => {
    if (a.releaseYear === null) return 1;
    if (b.releaseYear === null) return -1;
    return a.releaseYear - b.releaseYear;
  });

  // 3. Query ratings stats for all albums in this discography
  const albumRatingStats = new Map<
    string,
    { averageScore: number | null; ratingsCount: number }
  >();

  if (deduplicatedAlbums.length > 0) {
    const albumIds = deduplicatedAlbums.map((a) => a.id);
    const statsRows = await db
      .select({
        albumId: albumRatings.albumId,
        averageScore: sql<string | null>`ROUND(AVG(${albumRatings.score})::numeric, 1)::text`,
        ratingsCount: sql<string>`COUNT(*)::text`,
      })
      .from(albumRatings)
      .where(inArray(albumRatings.albumId, albumIds))
      .groupBy(albumRatings.albumId);

    for (const r of statsRows) {
      albumRatingStats.set(r.albumId, {
        averageScore: r.averageScore ? parseFloat(r.averageScore) : null,
        ratingsCount: parseInt(r.ratingsCount, 10) || 0,
      });
    }
  }

  const enrichedAlbums: ArtistAlbumItem[] = deduplicatedAlbums.map((a) => {
    const stats = albumRatingStats.get(a.id);
    return {
      id: a.id,
      title: a.title,
      artistName: a.artistName,
      releaseYear: a.releaseYear,
      defaultCoverUrl: a.defaultCoverUrl,
      averageScore: stats?.averageScore ?? null,
      ratingsCount: stats?.ratingsCount ?? 0,
    };
  });

  // 4. Query artistRatings stats
  const [ratingStats] = await db
    .select({
      averageScore: sql<string | null>`ROUND(AVG(${artistRatings.score})::numeric, 1)::text`,
      ratingsCount: sql<string>`COUNT(*)::text`,
    })
    .from(artistRatings)
    .where(
      sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${cleanArtistName}))`
    );

  const averageScore = ratingStats?.averageScore
    ? parseFloat(ratingStats.averageScore)
    : null;
  const ratingsCount = ratingStats?.ratingsCount
    ? parseInt(ratingStats.ratingsCount, 10)
    : 0;

  // 5. Query user's rating if logged in
  let userScore: number | null = null;
  if (viewerUserId) {
    const [userRatingRow] = await db
      .select({ score: artistRatings.score })
      .from(artistRatings)
      .where(
        and(
          eq(artistRatings.userId, viewerUserId),
          sql`LOWER(TRIM(${artistRatings.artistName})) = LOWER(TRIM(${cleanArtistName}))`
        )
      )
      .limit(1);

    if (userRatingRow) {
      userScore = userRatingRow.score;
    }
  }

  // 6. Query artistFollows stats
  const [followStats] = await db
    .select({
      followersCount: sql<string>`COUNT(*)::text`,
    })
    .from(artistFollows)
    .where(
      sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${cleanArtistName}))`
    );

  const followersCount = followStats?.followersCount
    ? parseInt(followStats.followersCount, 10)
    : 0;

  let isFollowing = false;
  if (viewerUserId) {
    const [followRow] = await db
      .select({ userId: artistFollows.userId })
      .from(artistFollows)
      .where(
        and(
          eq(artistFollows.userId, viewerUserId),
          sql`LOWER(TRIM(${artistFollows.artistName})) = LOWER(TRIM(${cleanArtistName}))`
        )
      )
      .limit(1);

    isFollowing = !!followRow;
  }

  // 7. Calculate career span from all albums with release year
  const years = enrichedAlbums
    .map((a) => a.releaseYear)
    .filter(
      (y): y is number =>
        typeof y === "number" && !Number.isNaN(y) && y >= 1900 && y <= 2100
    );

  let careerSpan: string | null = null;
  if (years.length > 0) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    careerSpan = minYear === maxYear ? `${minYear}` : `${minYear} – ${maxYear}`;
  }

  const pictureUrl =
    deezerArtist?.picture_xl ||
    deezerArtist?.picture_big ||
    deezerArtist?.picture_medium ||
    null;

  return {
    name: displayName,
    pictureUrl,
    nbFans: deezerArtist?.nb_fan ?? 0,
    followersCount,
    isFollowing,
    averageScore,
    ratingsCount,
    userScore,
    careerSpan,
    albums: enrichedAlbums,
  };
}
