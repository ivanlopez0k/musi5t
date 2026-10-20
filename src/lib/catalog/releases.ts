import { db } from "@/db";
import { albums, artistFollows } from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  cleanDisplayAlbumTitle,
  getCanonicalAlbumMbid,
  normalizeText,
} from "./musicbrainz";

export interface ReleaseAlbum {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string | null;
  releaseDateFormatted: string;
  releaseYear: number | null;
  coverUrl: string | null;
  averageScore: number | null;
  ratingsCount: number;
  curatorsCount: number;
  isFollowedArtist?: boolean;
}

export interface ReleasesGroup {
  dateLabel: string;
  dateKey: string;
  albums: ReleaseAlbum[];
}

export interface ReleasesFeedData {
  groups: ReleasesGroup[];
  totalReleases: number;
  activeView: "this-week" | "upcoming" | "my-artists" | "recent";
  followedArtistsCount: number;
}

export function formatReleaseDate(
  dateStr: string | null,
  releaseYear?: number | null
): string {
  if (!dateStr) return releaseYear ? `${releaseYear}` : "Announced";
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
      return dateStr;
    }
    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

interface ItunesEntry {
  "im:name"?: { label?: string };
  "im:artist"?: { label?: string };
  "im:releaseDate"?: { label?: string };
  "im:image"?: Array<{ label?: string }>;
}

/**
 * Background seed sync for fresh iTunes & Deezer releases.
 * Runs with Next.js revalidation so it never blocks page delivery.
 */
async function syncGlobalReleases(): Promise<void> {
  try {
    // Fetch iTunes top 50 new albums feed
    const itunesRes = await fetch(
      "https://itunes.apple.com/us/rss/topalbums/limit=50/json",
      { next: { revalidate: 21600 } }
    );

    if (itunesRes.ok) {
      const itunesJson = (await itunesRes.json()) as {
        feed?: { entry?: ItunesEntry[] };
      };

      const entries = itunesJson.feed?.entry || [];
      for (const entry of entries) {
        const rawTitle = entry["im:name"]?.label;
        const rawArtist = entry["im:artist"]?.label;
        const rawDate = entry["im:releaseDate"]?.label;
        const images = entry["im:image"] || [];
        const rawImage = images[images.length - 1]?.label;

        if (!rawTitle || !rawArtist) continue;

        const cleanTitle = cleanDisplayAlbumTitle(rawTitle);
        const cleanArtist = rawArtist.trim();
        const releaseDate = rawDate ? rawDate.slice(0, 10) : null;
        const releaseYear = releaseDate
          ? parseInt(releaseDate.slice(0, 4), 10)
          : null;
        const coverUrl = rawImage
          ? rawImage.replace(/\/\d+x\d+bb\./, "/600x600bb.")
          : "/images/musi5t/vinyl_player.webp";

        const mbid = getCanonicalAlbumMbid(cleanArtist, cleanTitle);

        await db
          .insert(albums)
          .values({
            mbid,
            title: cleanTitle,
            artistName: cleanArtist,
            releaseYear,
            releaseDate,
            defaultCoverUrl: coverUrl,
          })
          .onConflictDoUpdate({
            target: albums.mbid,
            set: {
              releaseDate: sql`COALESCE(${albums.releaseDate}, ${releaseDate})`,
              defaultCoverUrl: sql`COALESCE(${albums.defaultCoverUrl}, ${coverUrl})`,
              releaseYear: sql`COALESCE(${albums.releaseYear}, ${releaseYear})`,
            },
          });
      }
    }
  } catch {
    // Non-blocking sync failure ignored
  }
}

/**
 * Syncs recent and announced releases for artists followed by the user.
 */
async function syncFollowedArtistsReleases(artistNames: string[]): Promise<void> {
  if (artistNames.length === 0) return;

  const sample = artistNames.slice(0, 5); // bounded batch to respect rate limits
  for (const artist of sample) {
    try {
      const searchRes = await fetch(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}`,
        { next: { revalidate: 86400 } }
      );
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const artistId = searchData.data?.[0]?.id;
      if (!artistId) continue;

      const albumsRes = await fetch(
        `https://api.deezer.com/artist/${artistId}/albums?limit=8`,
        { next: { revalidate: 86400 } }
      );
      if (!albumsRes.ok) continue;
      const albumsData = await albumsRes.json();
      const discography = Array.isArray(albumsData.data) ? albumsData.data : [];

      for (const item of discography) {
        if (!item.title) continue;
        const cleanTitle = cleanDisplayAlbumTitle(item.title);
        const releaseDate = item.release_date || null;
        const releaseYear = releaseDate
          ? parseInt(releaseDate.slice(0, 4), 10)
          : null;
        const coverUrl =
          item.cover_xl || item.cover_big || "/images/musi5t/vinyl_player.webp";
        const mbid = getCanonicalAlbumMbid(artist, cleanTitle);

        await db
          .insert(albums)
          .values({
            mbid,
            title: cleanTitle,
            artistName: artist,
            releaseYear,
            releaseDate,
            defaultCoverUrl: coverUrl,
          })
          .onConflictDoUpdate({
            target: albums.mbid,
            set: {
              releaseDate: sql`COALESCE(${albums.releaseDate}, ${releaseDate})`,
              defaultCoverUrl: sql`COALESCE(${albums.defaultCoverUrl}, ${coverUrl})`,
              releaseYear: sql`COALESCE(${albums.releaseYear}, ${releaseYear})`,
            },
          });
      }
    } catch {
      // Ignore individual artist sync errors
    }
  }
}

export async function getReleasesData({
  view = "this-week",
  viewerUserId,
}: {
  view?: "this-week" | "upcoming" | "my-artists" | "recent";
  viewerUserId?: string | null;
}): Promise<ReleasesFeedData> {
  // 1. Fetch followed artists if user is authenticated
  let followedArtists: string[] = [];
  if (viewerUserId) {
    const follows = await db
      .select({ artistName: artistFollows.artistName })
      .from(artistFollows)
      .where(sql`${artistFollows.userId} = ${viewerUserId}::uuid`);
    followedArtists = follows.map((f) => f.artistName.trim());
  }

  // 2. Fire non-blocking sync
  if (view === "my-artists" && followedArtists.length > 0) {
    await syncFollowedArtistsReleases(followedArtists);
  } else {
    // Run global sync in background
    syncGlobalReleases().catch(() => {});
  }

  // 3. Compute date window
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Monday of current week
  const dayOfWeek = now.getDay();
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diffToMonday);
  const mondayStr = monday.toISOString().slice(0, 10);

  // Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayStr = sunday.toISOString().slice(0, 10);

  // 30 days ago
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  // Next 90 days for upcoming
  const ninetyDaysFuture = new Date(now);
  ninetyDaysFuture.setDate(now.getDate() + 90);
  const ninetyDaysFutureStr = ninetyDaysFuture.toISOString().slice(0, 10);

  // 4. Build query
  interface RawReleaseRow {
    id: string;
    title: string;
    artist_name: string;
    release_date: string | null;
    release_year: number | null;
    default_cover_url: string | null;
    average_score: string | null;
    ratings_count: string;
    curators_count: string;
    [key: string]: unknown;
  }

  let whereClause = sql`a.release_date IS NOT NULL`;

  if (view === "this-week") {
    whereClause = sql`
      a.release_date IS NOT NULL 
      AND a.release_date >= ${mondayStr} 
      AND a.release_date <= ${sundayStr}
    `;
  } else if (view === "upcoming") {
    whereClause = sql`
      a.release_date IS NOT NULL 
      AND a.release_date >= ${todayStr}
      AND a.release_date <= ${ninetyDaysFutureStr}
    `;
  } else if (view === "recent") {
    whereClause = sql`
      a.release_date IS NOT NULL 
      AND a.release_date >= ${thirtyDaysAgoStr} 
      AND a.release_date <= ${todayStr}
    `;
  } else if (view === "my-artists") {
    if (followedArtists.length > 0) {
      whereClause = sql`
        LOWER(TRIM(a.artist_name)) IN (${sql.join(
          followedArtists.map((name) => sql`${name.toLowerCase()}`),
          sql`, `
        )})
      `;
    } else {
      whereClause = sql`1 = 0`; // No followed artists yet
    }
  }

  const rows = await db.execute<RawReleaseRow>(sql`
    SELECT
      a.id,
      a.title,
      a.artist_name,
      a.release_date,
      a.release_year,
      a.default_cover_url,
      ROUND(ar_stat.avg_score::numeric, 1)::text AS average_score,
      COALESCE(ar_stat.ratings_count, 0)::text AS ratings_count,
      COALESCE(uta_stat.curators_count, 0)::text AS curators_count
    FROM albums a
    LEFT JOIN (
      SELECT album_id, AVG(score) AS avg_score, COUNT(*) AS ratings_count
      FROM album_ratings
      GROUP BY album_id
    ) ar_stat ON ar_stat.album_id = a.id
    LEFT JOIN (
      SELECT album_id, COUNT(*) AS curators_count
      FROM user_top_albums
      GROUP BY album_id
    ) uta_stat ON uta_stat.album_id = a.id
    WHERE ${whereClause}
    ORDER BY a.release_date DESC NULLS LAST, a.title ASC
    LIMIT 100;
  `);

  const followedSet = new Set(
    followedArtists.map((name) => normalizeText(name))
  );

  const mappedAlbums: ReleaseAlbum[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    artistName: r.artist_name,
    releaseDate: r.release_date,
    releaseDateFormatted: formatReleaseDate(r.release_date, r.release_year),
    releaseYear: r.release_year ? Number(r.release_year) : null,
    coverUrl: r.default_cover_url || "/images/musi5t/vinyl_player.webp",
    averageScore: r.average_score ? parseFloat(r.average_score) : null,
    ratingsCount: parseInt(r.ratings_count, 10) || 0,
    curatorsCount: parseInt(r.curators_count, 10) || 0,
    isFollowedArtist: followedSet.has(normalizeText(r.artist_name)),
  }));

  // 5. Group albums by release date
  const groupsMap = new Map<string, ReleaseAlbum[]>();

  for (const alb of mappedAlbums) {
    const key = alb.releaseDate || alb.releaseYear?.toString() || "Undated";
    const existing = groupsMap.get(key) || [];
    existing.push(alb);
    groupsMap.set(key, existing);
  }

  const groups: ReleasesGroup[] = Array.from(groupsMap.entries()).map(
    ([dateKey, items]) => ({
      dateKey,
      dateLabel: formatReleaseDate(
        dateKey.includes("-") ? dateKey : null,
        parseInt(dateKey, 10) || null
      ),
      albums: items,
    })
  );

  return {
    groups,
    totalReleases: mappedAlbums.length,
    activeView: view,
    followedArtistsCount: followedArtists.length,
  };
}
