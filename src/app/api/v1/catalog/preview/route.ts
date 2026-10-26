import { NextResponse, type NextRequest } from "next/server";

interface DeezerItem {
  id: number;
  title: string;
  preview?: string;
  artist?: {
    name?: string;
  };
}

interface ItunesItem {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = (searchParams.get("artist") || "").trim();
    const title = (searchParams.get("title") || "").trim();

    if (!artist && !title) {
      return NextResponse.json({ previewUrl: null }, { headers: CACHE_HEADERS });
    }

    const query = `${artist} ${title}`.trim();

    // 1. Query Deezer Search API
    try {
      const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
      const deezerRes = await fetch(deezerUrl, {
        next: { revalidate: 86400 },
      });

      if (deezerRes.ok) {
        const deezerJson = (await deezerRes.json()) as { data?: DeezerItem[] };
        if (Array.isArray(deezerJson.data) && deezerJson.data.length > 0) {
          const matchWithPreview = deezerJson.data.find(
            (item) => typeof item.preview === "string" && item.preview.trim().length > 0
          );
          if (matchWithPreview?.preview) {
            return NextResponse.json(
              { previewUrl: matchWithPreview.preview },
              { headers: CACHE_HEADERS }
            );
          }
        }
      }
    } catch {
      // Deezer failed or timed out; continue to iTunes fallback
    }

    // 2. Fall back to iTunes Search API
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=song&limit=5`;
      const itunesRes = await fetch(itunesUrl, {
        next: { revalidate: 86400 },
      });

      if (itunesRes.ok) {
        const itunesJson = (await itunesRes.json()) as { results?: ItunesItem[] };
        if (Array.isArray(itunesJson.results) && itunesJson.results.length > 0) {
          const matchWithPreview = itunesJson.results.find(
            (item) => typeof item.previewUrl === "string" && item.previewUrl.trim().length > 0
          );
          if (matchWithPreview?.previewUrl) {
            return NextResponse.json(
              { previewUrl: matchWithPreview.previewUrl },
              { headers: CACHE_HEADERS }
            );
          }
        }
      }
    } catch {
      // iTunes fallback failed
    }

    return NextResponse.json({ previewUrl: null }, { headers: CACHE_HEADERS });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[catalog preview route error]:", error);
    return NextResponse.json({ previewUrl: null }, { headers: CACHE_HEADERS });
  }
}
