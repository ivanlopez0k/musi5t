import { createHash } from "crypto";
import { db } from "@/db";
import { albums, songs } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";

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

interface ItunesAlbumItem {
  wrapperType?: string;
  collectionType?: string;
  collectionId?: number;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  trackCount?: number;
  country?: string;
}

interface ItunesSongItem {
  wrapperType?: string;
  kind?: string;
  trackId?: number;
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
}

const EDITION_TAG_PATTERN =
  /\b(deluxe|super deluxe|remaster(?:ed)?|expanded|special edition|anniversary|bonus track(?:s)?|collector(?:'s)?|edition|reissue|explicit|clean|version|live edition|digital|import|intl|international)\b/i;

const SPAM_KEYWORDS = [
  "karaoke",
  "tribute to",
  "originally performed by",
  "in the style of",
  "8-bit",
  "lullaby renditions",
  "piano tribute",
  "string quartet tribute",
  "backing track",
  "made famous by",
];

/**
 * Generates a deterministic RFC-4122 v5-compatible UUID from a canonical key.
 */
export function canonicalUuid(key: string): string {
  const hash = createHash("sha1")
    .update(`musi5t-catalog:${key}`)
    .digest();

  hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // RFC-4122 variant

  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Normalizes text for canonical comparisons (lowercase, no accents, alphanumeric only).
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Strips common edition/remaster/format suffixes from an album title for clean canonical display.
 */
export function cleanDisplayAlbumTitle(rawTitle: string): string {
  let cleaned = rawTitle.trim();

  // Remove parenthetical or bracketed edition/remaster tags
  cleaned = cleaned.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, (segment) => {
    return EDITION_TAG_PATTERN.test(segment) ? "" : segment;
  });

  // Remove trailing dash suffixes like "- EP", "- Single", "- Deluxe Edition", "- Remastered 2011"
  cleaned = cleaned.replace(
    /\s+-\s+(?:ep|single|deluxe.*|remaster.*|expanded.*|special edition.*|anniversary.*|bonus.*|collector.*)$/i,
    ""
  );

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned || rawTitle.trim();
}

export function normalizeAlbumTitle(rawTitle: string): string {
  return normalizeText(cleanDisplayAlbumTitle(rawTitle));
}

/**
 * Strips common remaster/version tags from a song title for clean canonical display.
 */
export function cleanDisplaySongTitle(rawTitle: string): string {
  let cleaned = rawTitle.trim();

  cleaned = cleaned.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, (segment) => {
    return /\b(remaster(?:ed)?|album version|single version|radio edit|explicit|clean|mono|stereo)\b/i.test(
      segment
    )
      ? ""
      : segment;
  });

  cleaned = cleaned.replace(
    /\s+-\s+(?:remaster(?:ed)?.*|single version.*|album version.*|radio edit.*|mono.*|stereo.*)$/i,
    ""
  );

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned || rawTitle.trim();
}

function getCanonicalAlbumKey(artistName: string, title: string): string {
  return `${normalizeText(artistName)}::${normalizeAlbumTitle(title)}`;
}

function getCanonicalSongKey(artistName: string, title: string): string {
  return `${normalizeText(artistName)}::${normalizeText(cleanDisplaySongTitle(title))}`;
}

function isSpamOrTribute(artistName: string, title: string, query: string): boolean {
  const lowerArtist = artistName.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();

  for (const keyword of SPAM_KEYWORDS) {
    if (
      (lowerArtist.includes(keyword) || lowerTitle.includes(keyword)) &&
      !lowerQuery.includes(keyword)
    ) {
      return true;
    }
  }
  return false;
}

function toHighResItunesCover(artworkUrl100?: string): string {
  if (!artworkUrl100) return "/images/musi5t/vinyl_player.webp";
  return artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg");
}

function deduplicateLocalAlbums(rows: CatalogAlbum[]): CatalogAlbum[] {
  const seen = new Set<string>();
  const result: CatalogAlbum[] = [];
  for (const row of rows) {
    const key = getCanonicalAlbumKey(row.artistName, row.title);
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...row,
        title: cleanDisplayAlbumTitle(row.title),
        defaultCoverUrl: row.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      });
    }
  }
  return result;
}

/**
 * Search official albums from Apple Music / iTunes with strict canonical deduplication
 * and local PostgreSQL persistence.
 */
export async function searchAlbums(query: string): Promise<CatalogAlbum[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      cleanQ
    )}&entity=album&limit=25`;

    const res = await fetch(itunesUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`iTunes album search returned ${res.status}`);
    }

    const data = await res.json();
    const rawResults: ItunesAlbumItem[] = Array.isArray(data.results) ? data.results : [];

    // Group & deduplicate canonical albums
    const grouped = new Map<
      string,
      {
        cleanTitle: string;
        artistName: string;
        releaseYear: number | null;
        coverUrl: string;
        score: number;
      }
    >();

    for (const item of rawResults) {
      if (item.wrapperType !== "collection" || item.collectionType !== "Album") continue;
      const artistName = item.artistName?.trim();
      const rawTitle = item.collectionName?.trim();
      if (!artistName || !rawTitle || !item.artworkUrl100) continue;

      // Filter out "Various Artists" compilations unless explicitly searched
      if (
        artistName.toLowerCase() === "various artists" &&
        !cleanQ.toLowerCase().includes("various")
      ) {
        continue;
      }

      // Filter out karaoke / tribute / cover spam
      if (isSpamOrTribute(artistName, rawTitle, cleanQ)) continue;

      // Filter out 1-track singles masquerading as albums
      const trackCount = item.trackCount ?? 0;
      if (trackCount <= 1 || /\s+-\s+single$/i.test(rawTitle)) continue;

      const cleanTitle = cleanDisplayAlbumTitle(rawTitle);
      const key = getCanonicalAlbumKey(artistName, cleanTitle);
      const year = item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : null;
      const validYear = year && !Number.isNaN(year) ? year : null;
      const coverUrl = toHighResItunesCover(item.artworkUrl100);

      // Prefer unadorned standard releases with full tracklists
      const isUnadornedTitle = rawTitle.toLowerCase() === cleanTitle.toLowerCase();
      const candidateScore = (isUnadornedTitle ? 20 : 0) + (trackCount >= 4 ? 10 : 0);

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          cleanTitle,
          artistName,
          releaseYear: validYear,
          coverUrl,
          score: candidateScore,
        });
      } else {
        // Keep earliest release year across editions
        const earliestYear =
          existing.releaseYear && validYear
            ? Math.min(existing.releaseYear, validYear)
            : existing.releaseYear ?? validYear;

        if (candidateScore > existing.score) {
          grouped.set(key, {
            cleanTitle,
            artistName,
            releaseYear: earliestYear,
            coverUrl,
            score: candidateScore,
          });
        } else {
          existing.releaseYear = earliestYear;
        }
      }
    }

    const canonicalItems = Array.from(grouped.entries()).slice(0, 10);
    const persistedAlbums: CatalogAlbum[] = [];

    for (const [key, item] of canonicalItems) {
      const deterministicMbid = canonicalUuid(`album:${key}`);

      // Check if an album with this exact normalized artist + title already exists in DB
      const [existingRow] = await db
        .select({
          id: albums.id,
          mbid: albums.mbid,
        })
        .from(albums)
        .where(
          or(
            eq(albums.mbid, deterministicMbid),
            and(
              sql`LOWER(TRIM(${albums.artistName})) = LOWER(TRIM(${item.artistName}))`,
              sql`LOWER(TRIM(${albums.title})) = LOWER(TRIM(${item.cleanTitle}))`
            )
          )
        )
        .limit(1);

      if (existingRow) {
        const [updated] = await db
          .update(albums)
          .set({
            title: item.cleanTitle,
            artistName: item.artistName,
            releaseYear: item.releaseYear,
            defaultCoverUrl: item.coverUrl,
          })
          .where(eq(albums.id, existingRow.id))
          .returning({
            id: albums.id,
            mbid: albums.mbid,
            title: albums.title,
            artistName: albums.artistName,
            releaseYear: albums.releaseYear,
            defaultCoverUrl: albums.defaultCoverUrl,
          });

        if (updated) {
          persistedAlbums.push({
            ...updated,
            defaultCoverUrl: updated.defaultCoverUrl || item.coverUrl,
          });
          continue;
        }
      }

      const [upserted] = await db
        .insert(albums)
        .values({
          mbid: deterministicMbid,
          title: item.cleanTitle,
          artistName: item.artistName,
          releaseYear: item.releaseYear,
          defaultCoverUrl: item.coverUrl,
        })
        .onConflictDoUpdate({
          target: albums.mbid,
          set: {
            title: item.cleanTitle,
            artistName: item.artistName,
            releaseYear: item.releaseYear,
            defaultCoverUrl: item.coverUrl,
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

      persistedAlbums.push({
        ...upserted,
        defaultCoverUrl: upserted.defaultCoverUrl || item.coverUrl,
      });
    }

    return persistedAlbums;
  } catch (error) {
    console.error("[searchAlbums fallback to local DB]:", error);
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
      .limit(15);

    return deduplicateLocalAlbums(
      localResults.map((r) => ({
        ...r,
        defaultCoverUrl: r.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      }))
    ).slice(0, 10);
  }
}

/**
 * Get official editions and artwork for an album from Apple Music / iTunes.
 */
export async function getAlbumEditions(
  mbid: string,
  defaultCover: string,
  title?: string,
  artistName?: string
): Promise<AlbumEdition[]> {
  const editions: AlbumEdition[] = [
    {
      releaseMbid: mbid,
      title: "Standard Edition",
      country: null,
      year: null,
      disambiguation: "Official Cover Art",
      coverUrl: defaultCover,
    },
  ];

  if (!title || !artistName) {
    return editions;
  }

  try {
    const term = `${artistName} ${title}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=15`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return editions;

    const data = await res.json();
    const rawResults: ItunesAlbumItem[] = Array.isArray(data.results) ? data.results : [];
    const targetArtistNorm = normalizeText(artistName);
    const targetAlbumNorm = normalizeAlbumTitle(title);

    const seenCovers = new Set<string>([defaultCover]);

    for (const item of rawResults) {
      if (item.wrapperType !== "collection" || item.collectionType !== "Album") continue;
      if (!item.artistName || !item.collectionName || !item.artworkUrl100) continue;

      if (normalizeText(item.artistName) !== targetArtistNorm) continue;
      if (normalizeAlbumTitle(item.collectionName) !== targetAlbumNorm) continue;

      const coverUrl = toHighResItunesCover(item.artworkUrl100);
      if (seenCovers.has(coverUrl)) continue;
      seenCovers.add(coverUrl);

      const year = item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : null;
      const releaseMbid = canonicalUuid(
        `edition:${item.collectionId || `${artistName}:${item.collectionName}`}`
      );

      editions.push({
        releaseMbid,
        title: item.collectionName.trim(),
        country: item.country || null,
        year: year && !Number.isNaN(year) ? year : null,
        disambiguation: null,
        coverUrl,
      });

      if (editions.length >= 6) break;
    }

    return editions;
  } catch {
    return editions;
  }
}

/**
 * Search official songs from Apple Music / iTunes with canonical deduplication
 * and local PostgreSQL persistence.
 */
export async function searchSongs(query: string): Promise<CatalogSong[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      cleanQ
    )}&entity=song&limit=25`;

    const res = await fetch(itunesUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`iTunes song search returned ${res.status}`);
    }

    const data = await res.json();
    const rawResults: ItunesSongItem[] = Array.isArray(data.results) ? data.results : [];

    const grouped = new Map<
      string,
      {
        cleanTitle: string;
        artistName: string;
        coverUrl: string | null;
      }
    >();

    for (const item of rawResults) {
      if (item.wrapperType !== "track" || item.kind !== "song") continue;
      const artistName = item.artistName?.trim();
      const rawTitle = item.trackName?.trim();
      if (!artistName || !rawTitle) continue;

      if (isSpamOrTribute(artistName, rawTitle, cleanQ)) continue;

      const cleanTitle = cleanDisplaySongTitle(rawTitle);
      const key = getCanonicalSongKey(artistName, cleanTitle);

      if (!grouped.has(key)) {
        grouped.set(key, {
          cleanTitle,
          artistName,
          coverUrl: item.artworkUrl100 ? toHighResItunesCover(item.artworkUrl100) : null,
        });
      }
    }

    const canonicalItems = Array.from(grouped.entries()).slice(0, 10);
    const persistedSongs: CatalogSong[] = [];

    for (const [key, item] of canonicalItems) {
      const deterministicMbid = canonicalUuid(`song:${key}`);

      const [existingRow] = await db
        .select({
          id: songs.id,
          mbid: songs.mbid,
        })
        .from(songs)
        .where(
          or(
            eq(songs.mbid, deterministicMbid),
            and(
              sql`LOWER(TRIM(${songs.artistName})) = LOWER(TRIM(${item.artistName}))`,
              sql`LOWER(TRIM(${songs.title})) = LOWER(TRIM(${item.cleanTitle}))`
            )
          )
        )
        .limit(1);

      if (existingRow) {
        const [updated] = await db
          .update(songs)
          .set({
            title: item.cleanTitle,
            artistName: item.artistName,
            coverUrl: item.coverUrl,
          })
          .where(eq(songs.id, existingRow.id))
          .returning({
            id: songs.id,
            mbid: songs.mbid,
            title: songs.title,
            artistName: songs.artistName,
            coverUrl: songs.coverUrl,
          });

        if (updated) {
          persistedSongs.push(updated);
          continue;
        }
      }

      const [upserted] = await db
        .insert(songs)
        .values({
          mbid: deterministicMbid,
          title: item.cleanTitle,
          artistName: item.artistName,
          coverUrl: item.coverUrl,
        })
        .onConflictDoUpdate({
          target: songs.mbid,
          set: {
            title: item.cleanTitle,
            artistName: item.artistName,
            coverUrl: item.coverUrl,
          },
        })
        .returning({
          id: songs.id,
          mbid: songs.mbid,
          title: songs.title,
          artistName: songs.artistName,
          coverUrl: songs.coverUrl,
        });

      persistedSongs.push(upserted);
    }

    return persistedSongs;
  } catch (err) {
    console.error("[searchSongs fallback to local DB]:", err);
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

    return localSongs;
  }
}
