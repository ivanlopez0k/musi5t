import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { albums } from "@/db/schema";
import { getAlbumEditions } from "@/lib/catalog/musicbrainz";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [album] = await db
      .select()
      .from(albums)
      .where(eq(albums.id, id))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const editions = await getAlbumEditions(
      album.mbid,
      album.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      album.title,
      album.artistName
    );

    return NextResponse.json({
      album: {
        id: album.id,
        title: album.title,
        artistName: album.artistName,
        releaseYear: album.releaseYear,
        defaultCoverUrl: album.defaultCoverUrl,
      },
      editions,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[covers error]:", error);
    return NextResponse.json({ error: "Failed to fetch album editions" }, { status: 500 });
  }
}
