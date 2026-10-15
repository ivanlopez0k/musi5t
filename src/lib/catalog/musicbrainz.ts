import { db } from "@/db";
import { albums, songs } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";

const USER_AGENT =
  process.env.MUSICBRAINZ_USER_AGENT || "musi5t/0.1.0 ( contact@musi5t.local )";

export interface CatalogAlbum {
  id: string; // Database UUID
  mbid: string;
  title: string;
  artistName: string;
  releaseYear: number | null;
  defaultCoverUrl: string;
}

export interface AlbumEdition {
  releaseMbid: string;
  title: string;
  country: string | null;
  year: number | null;
  disambiguation: string | null;
  coverUrl: string;
}

export interface CatalogSong {
  id: string; // Database UUID
  mbid: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
}

/**
 * Fetch high-res artwork fallback from iTunes
 */
async function fetchItunesCover(artist: string, title: string): Promise<string | null> {
  try {
    const term = `${artist} ${title}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.results?.[0];
    if (item?.artworkUrl100) {
      return item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Search albums with local Postgres caching
 */
export async function searchAlbums(query: string): Promise<CatalogAlbum[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  // 1. Check local DB cache
  const localResults = await db
    .select({
      id: albums.id,
      mbid: albums.mbid,
      title: albums.title,
      artistName: albums.artistName,
      releaseYear: albums.releaseYear,
      defaultCoverUrl: albums.defaultCoverUrl,
    })
    .from(albums)
    .where(
      or(
        sql`LOWER(${albums.title}) LIKE ${`%${cleanQ.toLowerCase()}%`}`,
        sql`LOWER(${albums.artistName}) LIKE ${`%${cleanQ.toLowerCase()}%`}`
      )
    )
    .limit(10);

  // If local DB has good matches (3 or more), return them directly
  if (localResults.length >= 4) {
    return localResults.map((r) => ({
      ...r,
      defaultCoverUrl: r.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
    }));
  }

  // 2. Query MusicBrainz release-groups
  try {
    const mbUrl = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
      cleanQ
    )}&fmt=json&limit=8`;

    const res = await fetch(mbUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      return localResults.map((r) => ({
        ...r,
        defaultCoverUrl: r.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      }));
    }

    const data = await res.json();
    const releaseGroups = data["release-groups"] || [];

    const fetchedAlbums: CatalogAlbum[] = [];

    for (const rg of releaseGroups) {
      const mbid = rg.id;
      const title = rg.title;
      const artistName =
        rg["artist-credit"]?.map((a: { name: string }) => a.name).join(" ") || "Unknown Artist";
      const releaseYear = rg["first-release-date"]
        ? parseInt(rg["first-release-date"].slice(0, 4), 10)
        : null;

      // CAA direct URL
      const caaUrl = `https://coverartarchive.org/release-group/${mbid}/front-500`;

      // Try iTunes high-res artwork as reliable primary or fallback
      const itunesCover = await fetchItunesCover(artistName, title);
      const defaultCoverUrl = itunesCover || caaUrl;

      // Upsert into local PostgreSQL albums cache
      const [upserted] = await db
        .insert(albums)
        .values({
          mbid,
          title,
          artistName,
          releaseYear,
          defaultCoverUrl,
        })
        .onConflictDoUpdate({
          target: albums.mbid,
          set: {
            title,
            artistName,
            releaseYear,
            defaultCoverUrl,
          },
        })
        .returning({
          id: albums.id,
          mbid: albums.mbid,
          title: albums.title,
          artistName: albums.artistName,
          releaseYear: albums.releaseYear,
          defaultCoverUrl: albums.defaultCoverUrl,
        });

      fetchedAlbums.push({
        ...upserted,
        defaultCoverUrl: upserted.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      });
    }

    // Merge local results with freshly fetched albums, avoiding duplicates by mbid
    const seen = new Set<string>();
    const combined: CatalogAlbum[] = [];

    for (const item of [...localResults, ...fetchedAlbums]) {
      if (!seen.has(item.mbid)) {
        seen.add(item.mbid);
        combined.push({
          ...item,
          defaultCoverUrl: item.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
        });
      }
    }

    return combined.slice(0, 10);
  } catch (error) {
    console.error("[searchAlbums error]:", error);
    return localResults.map((r) => ({
      ...r,
      defaultCoverUrl: r.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
    }));
  }
}

/**
 * Get available editions and artwork for an album release-group
 */
export async function getAlbumEditions(mbid: string, defaultCover: string): Promise<AlbumEdition[]> {
  const editions: AlbumEdition[] = [
    {
      releaseMbid: mbid,
      title: "Standard Edition",
      country: null,
      year: null,
      disambiguation: "Default Artwork",
      coverUrl: defaultCover,
    },
  ];

  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/release-group/${mbid}?inc=releases&fmt=json`,
      { headers: { "User-Agent": USER_AGENT } }
    );

    if (!res.ok) return editions;

    const data = await res.json();
    const releases = (data.releases || []).slice(0, 6);

    for (const rel of releases) {
      const relMbid = rel.id;
      const title = rel.title || "Special Edition";
      const country = rel.country || null;
      const year = rel.date ? parseInt(rel.date.slice(0, 4), 10) : null;
      const disambiguation = rel.disambiguation || null;
      const coverUrl = `https://coverartarchive.org/release/${relMbid}/front-500`;

      editions.push({
        releaseMbid: relMbid,
        title,
        country,
        year,
        disambiguation,
        coverUrl,
      });
    }

    return editions;
  } catch {
    return editions;
  }
}

/**
 * Search songs with local Postgres caching
 */
export async function searchSongs(query: string): Promise<CatalogSong[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  // Check local cache
  const localSongs = await db
    .select({
      id: songs.id,
      mbid: songs.mbid,
      title: songs.title,
      artistName: songs.artistName,
      coverUrl: songs.coverUrl,
    })
    .from(songs)
    .where(
      or(
        sql`LOWER(${songs.title}) LIKE ${`%${cleanQ.toLowerCase()}%`}`,
        sql`LOWER(${songs.artistName}) LIKE ${`%${cleanQ.toLowerCase()}%`}`
      )
    )
    .limit(10);

  if (localSongs.length >= 4) {
    return localSongs;
  }

  // Search MusicBrainz recordings
  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(cleanQ)}&fmt=json&limit=8`,
      { headers: { "User-Agent": USER_AGENT } }
    );

    if (!res.ok) return localSongs;

    const data = await res.json();
    const recordings = data.recordings || [];

    const fetchedSongs: CatalogSong[] = [];

    for (const rec of recordings) {
      const mbid = rec.id;
      const title = rec.title;
      const artistName =
        rec["artist-credit"]?.map((a: { name: string }) => a.name).join(" ") || "Unknown Artist";

      // Also fetch quick cover from iTunes
      const coverUrl = await fetchItunesCover(artistName, title);

      const [upserted] = await db
        .insert(songs)
        .values({
          mbid,
          title,
          artistName,
          coverUrl,
        })
        .onConflictDoUpdate({
          target: songs.mbid,
          set: { title, artistName, coverUrl },
        })
        .returning({
          id: songs.id,
          mbid: songs.mbid,
          title: songs.title,
          artistName: songs.artistName,
          coverUrl: songs.coverUrl,
        });

      fetchedSongs.push(upserted);
    }

    const seen = new Set<string>();
    const combined: CatalogSong[] = [];

    for (const item of [...localSongs, ...fetchedSongs]) {
      if (!seen.has(item.mbid)) {
        seen.add(item.mbid);
        combined.push(item);
      }
    }

    return combined.slice(0, 10);
  } catch (err) {
    console.error("[searchSongs error]:", err);
    return localSongs;
  }
}
