import { db } from "@/db";
import { albumTracks } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import {
  cleanDisplayAlbumTitle,
  normalizeAlbumTitle,
  normalizeText,
} from "./musicbrainz";

export interface AlbumTrack {
  position: number;
  title: string;
  durationSeconds: number;
  durationFormatted: string; // e.g. "3:57"
}

export interface AlbumTracklist {
  tracks: AlbumTrack[];
  totalTracks: number;
  totalDurationFormatted: string; // e.g. "42 min" or "42 min 39 sec"
}

interface DeezerAlbumSearchItem {
  id: number;
  title: string;
  artist?: {
    id?: number;
    name?: string;
  };
  nb_tracks?: number;
}

interface DeezerTrackItem {
  id?: number;
  title?: string;
  title_short?: string;
  duration?: number;
  track_position?: number;
  disk_number?: number;
}

interface ItunesSongItem {
  wrapperType?: string;
  kind?: string;
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  trackName?: string;
  trackNumber?: number;
  trackTimeMillis?: number;
  discNumber?: number;
}

async function persistTracks(
  albumId: string | undefined,
  tracks: AlbumTrack[]
): Promise<void> {
  if (!albumId || tracks.length === 0) return;
  try {
    await db
      .insert(albumTracks)
      .values(
        tracks.map((t) => ({
          albumId,
          position: t.position,
          title: t.title,
          durationSeconds: t.durationSeconds,
        }))
      )
      .onConflictDoNothing();
  } catch {
    // Ignore cache persistence errors gracefully
  }
}

export function formatTrackDuration(durationSeconds: number): string {
  if (!durationSeconds || durationSeconds <= 0) return "--:--";
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTotalDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const remSeconds = totalSeconds % 3600;
  const mins = Math.floor(remSeconds / 60);
  const secs = remSeconds % 60;

  if (hours > 0) {
    if (mins > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${hours} hr`;
  }

  if (secs > 0) {
    return `${mins} min ${secs} sec`;
  }
  return `${mins} min`;
}

function isNextDigest(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err;
}

/**
 * Resolves the full tracklist for an album, prioritizing Deezer and falling back to Apple Music / iTunes.
 * Caches resolved tracks into PostgreSQL album_tracks table for sub-millisecond local reads.
 */
export async function getAlbumTracklist(
  artistName: string,
  albumTitle: string,
  albumId?: string
): Promise<AlbumTracklist> {
  const emptyTracklist: AlbumTracklist = {
    tracks: [],
    totalTracks: 0,
    totalDurationFormatted: "",
  };

  const cleanArtist = artistName?.trim();
  const cleanTitle = albumTitle?.trim();

  if (!cleanArtist || !cleanTitle) {
    return emptyTracklist;
  }

  // 0. Check PostgreSQL write-through cache first
  if (albumId) {
    try {
      const cached = await db
        .select({
          position: albumTracks.position,
          title: albumTracks.title,
          durationSeconds: albumTracks.durationSeconds,
        })
        .from(albumTracks)
        .where(eq(albumTracks.albumId, albumId))
        .orderBy(asc(albumTracks.position));

      if (cached.length > 0) {
        const totalSeconds = cached.reduce(
          (sum, t) => sum + (t.durationSeconds || 0),
          0
        );
        return {
          tracks: cached.map((t) => ({
            position: t.position,
            title: t.title,
            durationSeconds: t.durationSeconds,
            durationFormatted: formatTrackDuration(t.durationSeconds),
          })),
          totalTracks: cached.length,
          totalDurationFormatted: formatTotalDuration(totalSeconds),
        };
      }
    } catch {
      // Gracefully continue to external search on DB read error
    }
  }

  const targetArtistNorm = normalizeText(cleanArtist);
  const targetAlbumNorm = normalizeAlbumTitle(cleanTitle);
  const cleanDisplayTitle = cleanDisplayAlbumTitle(cleanTitle);

  try {
    // 1. Query Deezer Search API
    const deezerSearchUrl = `https://api.deezer.com/search/album?q=${encodeURIComponent(
      `${cleanArtist} ${cleanDisplayTitle}`
    )}&limit=8`;

    let deezerAlbumId: number | null = null;

    try {
      const searchRes = await fetch(deezerSearchUrl, {
        next: { revalidate: 86400 },
      });

      if (searchRes.ok) {
        const searchJson = (await searchRes.json()) as {
          data?: DeezerAlbumSearchItem[];
        };

        if (Array.isArray(searchJson.data) && searchJson.data.length > 0) {
          // Exact match search
          let match = searchJson.data.find((item) => {
            const itemArtist = normalizeText(item.artist?.name || "");
            const itemAlbum = normalizeAlbumTitle(item.title || "");
            return (
              itemArtist === targetArtistNorm && itemAlbum === targetAlbumNorm
            );
          });

          // Fuzzy / includes match if no exact match found
          if (!match) {
            match = searchJson.data.find((item) => {
              const itemArtist = normalizeText(item.artist?.name || "");
              const itemAlbum = normalizeAlbumTitle(item.title || "");
              const artistMatches =
                itemArtist === targetArtistNorm ||
                itemArtist.includes(targetArtistNorm) ||
                targetArtistNorm.includes(itemArtist);
              const albumMatches =
                itemAlbum === targetAlbumNorm ||
                itemAlbum.includes(targetAlbumNorm) ||
                targetAlbumNorm.includes(itemAlbum);
              return artistMatches && albumMatches;
            });
          }

          // If still not found, take first result if artist name matches
          if (!match) {
            match = searchJson.data.find((item) => {
              const itemArtist = normalizeText(item.artist?.name || "");
              return (
                itemArtist === targetArtistNorm ||
                itemArtist.includes(targetArtistNorm) ||
                targetArtistNorm.includes(itemArtist)
              );
            });
          }

          if (match?.id) {
            deezerAlbumId = match.id;
          }
        }
      }
    } catch (e) {
      if (isNextDigest(e)) throw e;
      // Continue to iTunes fallback on Deezer search failure
    }

    // If Deezer album found, fetch tracks
    if (deezerAlbumId) {
      try {
        const tracksUrl = `https://api.deezer.com/album/${deezerAlbumId}/tracks?limit=100`;
        const tracksRes = await fetch(tracksUrl, {
          next: { revalidate: 86400 },
        });

        if (tracksRes.ok) {
          const tracksJson = (await tracksRes.json()) as {
            data?: DeezerTrackItem[];
          };

          if (Array.isArray(tracksJson.data) && tracksJson.data.length > 0) {
            const tracks: AlbumTrack[] = tracksJson.data.map((item, index) => {
              const durationSeconds =
                typeof item.duration === "number" ? Math.max(0, item.duration) : 0;
              return {
                position: item.track_position || index + 1,
                title: item.title_short || item.title || `Track ${index + 1}`,
                durationSeconds,
                durationFormatted: formatTrackDuration(durationSeconds),
              };
            });

            const totalTracks = tracks.length;
            const totalSeconds = tracks.reduce((sum, t) => sum + t.durationSeconds, 0);

            if (albumId && tracks.length > 0) {
              await persistTracks(albumId, tracks);
            }

            return {
              tracks,
              totalTracks,
              totalDurationFormatted: formatTotalDuration(totalSeconds),
            };
          }
        }
      } catch (e) {
        if (isNextDigest(e)) throw e;
        // Continue to iTunes fallback on Deezer tracks failure
      }
    }

    // 2. Fallback to Apple Music / iTunes song search
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      `${cleanArtist} ${cleanDisplayTitle}`
    )}&entity=song&limit=60`;

    const itunesRes = await fetch(itunesUrl, {
      next: { revalidate: 86400 },
    });

    if (itunesRes.ok) {
      const itunesJson = (await itunesRes.json()) as {
        results?: ItunesSongItem[];
      };

      if (Array.isArray(itunesJson.results) && itunesJson.results.length > 0) {
        const songsWithTitle = itunesJson.results.filter(
          (item) => typeof item.trackName === "string" && item.trackName.trim().length > 0
        );

        // Group matching songs by collectionId
        const collectionGroups = new Map<number, ItunesSongItem[]>();

        for (const song of songsWithTitle) {
          const itemArtist = normalizeText(song.artistName || "");
          const itemAlbum = normalizeAlbumTitle(song.collectionName || "");

          const artistMatches =
            itemArtist === targetArtistNorm ||
            itemArtist.includes(targetArtistNorm) ||
            targetArtistNorm.includes(itemArtist);
          const albumMatches =
            itemAlbum === targetAlbumNorm ||
            itemAlbum.includes(targetAlbumNorm) ||
            targetAlbumNorm.includes(itemAlbum);

          if (artistMatches && albumMatches) {
            const colId = song.collectionId || 0;
            const group = collectionGroups.get(colId) || [];
            group.push(song);
            collectionGroups.set(colId, group);
          }
        }

        if (collectionGroups.size > 0) {
          // Pick the collection with the most tracks
          let bestSongs: ItunesSongItem[] = [];
          for (const songs of collectionGroups.values()) {
            if (songs.length > bestSongs.length) {
              bestSongs = songs;
            }
          }

          // Sort by discNumber, then trackNumber
          bestSongs.sort((a, b) => {
            const discDiff = (a.discNumber || 1) - (b.discNumber || 1);
            if (discDiff !== 0) return discDiff;
            return (a.trackNumber || 0) - (b.trackNumber || 0);
          });

          // Deduplicate track positions or map cleanly
          const tracks: AlbumTrack[] = bestSongs.map((item, index) => {
            const durationSeconds = item.trackTimeMillis
              ? Math.round(item.trackTimeMillis / 1000)
              : 0;
            return {
              position: item.trackNumber || index + 1,
              title: item.trackName || `Track ${index + 1}`,
              durationSeconds,
              durationFormatted: formatTrackDuration(durationSeconds),
            };
          });

          const totalTracks = tracks.length;
          const totalSeconds = tracks.reduce((sum, t) => sum + t.durationSeconds, 0);

          if (albumId && tracks.length > 0) {
            await persistTracks(albumId, tracks);
          }

          return {
            tracks,
            totalTracks,
            totalDurationFormatted: formatTotalDuration(totalSeconds),
          };
        }
      }
    }

    return emptyTracklist;
  } catch (error) {
    if (isNextDigest(error)) throw error;
    console.error("Error fetching album tracklist:", error);
    return emptyTracklist;
  }
}
