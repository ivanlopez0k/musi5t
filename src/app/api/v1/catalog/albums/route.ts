import { NextResponse, type NextRequest } from "next/server";
import { searchAlbums } from "@/lib/catalog/musicbrainz";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) {
      return NextResponse.json({ albums: [] });
    }

    const albums = await searchAlbums(q);
    return NextResponse.json({ albums });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[catalog albums search error]:", error);
    return NextResponse.json({ error: "Failed to search albums" }, { status: 500 });
  }
}
