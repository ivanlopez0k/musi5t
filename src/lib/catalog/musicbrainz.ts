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

interface DeezerAlbumItem {
  id?: number;
  title?: string;
  artist?: {
    id?: number;
    name?: string;
  };
  cover?: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  release_date?: string;
  record_type?: string;
  nb_tracks?: number;
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

export function getCanonicalAlbumKey(artistName: string, title: string): string {
  return `${normalizeText(artistName)}::${normalizeAlbumTitle(title)}`;
}

export function getCanonicalAlbumMbid(artistName: string, title: string): string {
  const key = getCanonicalAlbumKey(artistName, title);
  return canonicalUuid(`album:${key}`);
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
    const deezerUrl = `https://api.deezer.com/search/album?q=${encodeURIComponent(
      cleanQ
    )}&limit=15`;

    const [itunesRes, deezerRes] = await Promise.allSettled([
      fetch(itunesUrl, {
        next: { revalidate: 3600 },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`iTunes album search returned ${res.status}`);
        return (await res.json()) as { results?: ItunesAlbumItem[] };
      }),
      fetch(deezerUrl, {
        next: { revalidate: 3600 },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Deezer album search returned ${res.status}`);
        return (await res.json()) as { data?: DeezerAlbumItem[] };
      }),
    ]);

    const rawItunesResults: ItunesAlbumItem[] =
      itunesRes.status === "fulfilled" && Array.isArray(itunesRes.value?.results)
        ? itunesRes.value.results
        : [];

    const rawDeezerResults: DeezerAlbumItem[] =
      deezerRes.status === "fulfilled" && Array.isArray(deezerRes.value?.data)
        ? deezerRes.value.data
        : [];

    if (
      rawItunesResults.length === 0 &&
      rawDeezerResults.length === 0 &&
      itunesRes.status === "rejected" &&
      deezerRes.status === "rejected"
    ) {
      throw new Error("Both iTunes and Deezer searches failed");
    }

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

    const pickBestCover = (coverA: string, coverB: string): string => {
      const isDefault = (url: string) => !url || url.includes("vinyl_player.webp");
      if (isDefault(coverA)) return coverB;
      if (isDefault(coverB)) return coverA;
      if (coverB.includes("cover_xl") && !coverA.includes("cover_xl")) return coverB;
      return coverA;
    };

    // 1. Process iTunes results
    for (const item of rawItunesResults) {
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

      // Only discard if explicit single
      if (/\s+-\s+single$/i.test(rawTitle)) continue;

      const trackCount = item.trackCount ?? 0;
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
        const earliestYear =
          existing.releaseYear && validYear
            ? Math.min(existing.releaseYear, validYear)
            : existing.releaseYear ?? validYear;

        const bestCover = pickBestCover(existing.coverUrl, coverUrl);

        if (candidateScore > existing.score) {
          grouped.set(key, {
            cleanTitle,
            artistName,
            releaseYear: earliestYear,
            coverUrl: bestCover,
            score: candidateScore,
          });
        } else {
          existing.releaseYear = earliestYear;
          existing.coverUrl = bestCover;
        }
      }
    }

    // 2. Process Deezer results
    for (const item of rawDeezerResults) {
      const artistName = item.artist?.name?.trim();
      const rawTitle = item.title?.trim();
      if (!artistName || !rawTitle) continue;

      // Filter out "Various Artists" compilations unless explicitly searched
      if (
        artistName.toLowerCase() === "various artists" &&
        !cleanQ.toLowerCase().includes("various")
      ) {
        continue;
      }

      // Filter out karaoke / tribute / cover spam
      if (isSpamOrTribute(artistName, rawTitle, cleanQ)) continue;

      // Discard singles
      if (item.record_type === "single" || /\s+-\s+single$/i.test(rawTitle)) continue;

      const cleanTitle = cleanDisplayAlbumTitle(rawTitle);
      const key = getCanonicalAlbumKey(artistName, cleanTitle);
      const year = item.release_date ? parseInt(item.release_date.slice(0, 4), 10) : null;
      const validYear = year && !Number.isNaN(year) ? year : null;
      const coverUrl =
        item.cover_xl || item.cover_big || item.cover_medium || item.cover || "/images/musi5t/vinyl_player.webp";

      const isUnadornedTitle = rawTitle.toLowerCase() === cleanTitle.toLowerCase();
      const candidateScore = (isUnadornedTitle ? 20 : 0) + ((item.nb_tracks ?? 0) >= 4 ? 10 : 0);

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
        const earliestYear =
          existing.releaseYear && validYear
            ? Math.min(existing.releaseYear, validYear)
            : existing.releaseYear ?? validYear;

        const bestCover = pickBestCover(existing.coverUrl, coverUrl);

        if (candidateScore > existing.score) {
          grouped.set(key, {
            cleanTitle,
            artistName,
            releaseYear: earliestYear,
            coverUrl: bestCover,
            score: candidateScore,
          });
        } else {
          existing.releaseYear = earliestYear;
          existing.coverUrl = bestCover;
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

const MUSICBRAINZ_USER_AGENT =
  process.env.MUSICBRAINZ_USER_AGENT || "musi5t/1.0.0 ( contact@musi5t.local )";

const COUNTRY_NAMES: Record<string, string> = {
  JP: "Japan",
  GB: "UK",
  UK: "UK",
  US: "United States",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  AU: "Australia",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  NL: "Netherlands",
  SE: "Sweden",
  XE: "Europe",
  XW: "Worldwide",
  ID: "Indonesia",
  KR: "South Korea",
};

function formatPressingDisambiguation(
  country: string | null,
  disambiguation: string | null
): string {
  const cName = country ? COUNTRY_NAMES[country.toUpperCase()] || country : null;
  if (disambiguation && cName) {
    if (disambiguation.toLowerCase().includes(cName.toLowerCase())) {
      return disambiguation;
    }
    return `${disambiguation} (${cName})`;
  }
  if (disambiguation) {
    return disambiguation;
  }
  if (cName && country) {
    return `${cName} Pressing`;
  }
  return "Special Pressing";
}

/**
 * Get official editions and artwork for an album from MusicBrainz / Cover Art Archive
 * (physical international pressings from Japan, UK, US, etc.) and Apple Music / iTunes.
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

  const seenCovers = new Set<string>([defaultCover]);

  // 1. MusicBrainz release-groups & Cover Art Archive (physical international pressings)
  try {
    const cleanTitle = cleanDisplayAlbumTitle(title).replace(/["]/g, "").trim();
    const cleanArtist = artistName.replace(/["]/g, "").trim();
    const query = `releasegroup:"${cleanTitle}" AND artist:"${cleanArtist}"`;

    const rgRes = await fetch(
      `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
      {
        headers: { "User-Agent": MUSICBRAINZ_USER_AGENT },
        next: { revalidate: 604800 }, // 7 days cache
      }
    );

    if (rgRes.ok) {
      const rgData = await rgRes.json();
      const targetArtistNorm = normalizeText(artistName);
      const targetTitleNorm = normalizeAlbumTitle(title);

      const rgs: Array<{
        id: string;
        title: string;
        "artist-credit"?: Array<{ name: string }>;
      }> = Array.isArray(rgData["release-groups"]) ? rgData["release-groups"] : [];

      const matchedRg =
        rgs.find((item) => {
          const itemTitleNorm = normalizeAlbumTitle(item.title || "");
          const artistCreditNorm = normalizeText(
            item["artist-credit"]?.map((a) => a.name).join(" ") || ""
          );
          return (
            itemTitleNorm === targetTitleNorm &&
            (artistCreditNorm.includes(targetArtistNorm) ||
              targetArtistNorm.includes(artistCreditNorm))
          );
        }) || rgs[0];

      if (matchedRg) {
        const relRes = await fetch(
          `https://musicbrainz.org/ws/2/release/?release-group=${matchedRg.id}&fmt=json&limit=60`,
          {
            headers: { "User-Agent": MUSICBRAINZ_USER_AGENT },
            next: { revalidate: 604800 },
          }
        );

        if (relRes.ok) {
          const relData = await relRes.json();
          const releases: Array<{
            id: string;
            title: string;
            country?: string;
            date?: string;
            disambiguation?: string;
            "cover-art-archive"?: { front?: boolean };
          }> = Array.isArray(relData.releases) ? relData.releases : [];

          // Group by country to ensure international pressings (JP, GB, US, CA, etc.) are highlighted
          const countryBuckets = new Map<string, typeof releases>();

          for (const r of releases) {
            if (!r["cover-art-archive"]?.front) continue;
            const country = r.country ? r.country.toUpperCase() : "OTHER";
            if (!countryBuckets.has(country)) {
              countryBuckets.set(country, []);
            }
            countryBuckets.get(country)!.push(r);
          }

          // Pick up to 2 distinct pressings per country
          for (const [, rels] of countryBuckets.entries()) {
            for (const r of rels.slice(0, 2)) {
              const coverUrl = `https://coverartarchive.org/release/${r.id}/front-500`;
              if (seenCovers.has(coverUrl)) continue;
              seenCovers.add(coverUrl);

              const year = r.date ? parseInt(r.date.slice(0, 4), 10) : null;
              const country = r.country ? r.country.toUpperCase() : null;
              const disambiguation = formatPressingDisambiguation(
                country,
                r.disambiguation || null
              );

              editions.push({
                releaseMbid: r.id,
                title: r.title,
                country,
                year: year && !Number.isNaN(year) ? year : null,
                disambiguation,
                coverUrl,
              });

              if (editions.length >= 14) break;
            }
            if (editions.length >= 14) break;
          }
        }
      }
    }
  } catch (mbErr) {
    console.error("[getAlbumEditions MusicBrainz error]:", mbErr);
  }

  // 2. Apple Music / iTunes (Digital Deluxe, Remastered, Anniversary editions)
  try {
    const term = `${artistName} ${cleanDisplayAlbumTitle(title)}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=15`,
      { next: { revalidate: 86400 } }
    );

    if (res.ok) {
      const data = await res.json();
      const rawResults: ItunesAlbumItem[] = Array.isArray(data.results) ? data.results : [];
      const targetArtistNorm = normalizeText(artistName);
      const targetAlbumNorm = normalizeAlbumTitle(title);

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

        const isDeluxe = EDITION_TAG_PATTERN.test(item.collectionName);

        editions.push({
          releaseMbid,
          title: item.collectionName.trim(),
          country: item.country || null,
          year: year && !Number.isNaN(year) ? year : null,
          disambiguation: isDeluxe ? "Deluxe / Digital Release" : "Digital Release",
          coverUrl,
        });

        if (editions.length >= 16) break;
      }
    }
  } catch (itunesErr) {
    console.error("[getAlbumEditions iTunes error]:", itunesErr);
  }

  return editions;
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
