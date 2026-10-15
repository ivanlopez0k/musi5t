import { NextResponse, type NextRequest } from "next/server";
import { searchSongs } from "@/lib/catalog/musicbrainz";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) {
      return NextResponse.json({ songs: [] });
    }

    const songsList = await searchSongs(q);
    return NextResponse.json({ songs: songsList });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[catalog songs search error]:", error);
    return NextResponse.json({ error: "Failed to search songs" }, { status: 500 });
  }
}
