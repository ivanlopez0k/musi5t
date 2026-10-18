import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import {
  cleanDisplayAlbumTitle,
  getCanonicalAlbumMbid,
} from "@/lib/catalog/musicbrainz";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, artistName, releaseYear, coverUrl, sourceUrl } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Record title is required." },
        { status: 400 }
      );
    }

    if (!artistName || typeof artistName !== "string" || !artistName.trim()) {
      return NextResponse.json(
        { error: "Artist name is required." },
        { status: 400 }
      );
    }

    const cleanTitle = cleanDisplayAlbumTitle(title.trim());
    const cleanArtist = artistName.trim();

    let validYear: number | null = null;
    if (releaseYear !== undefined && releaseYear !== null && releaseYear !== "") {
      const parsedYear = Number(releaseYear);
      if (
        Number.isInteger(parsedYear) &&
        parsedYear >= 1900 &&
        parsedYear <= 2099
      ) {
        validYear = parsedYear;
      }
    }

    let finalCoverUrl = "/images/musi5t/vinyl_player.webp";
    if (coverUrl && typeof coverUrl === "string") {
      const trimmedCover = coverUrl.trim();
      if (/^https?:\/\/.+/i.test(trimmedCover)) {
        finalCoverUrl = trimmedCover;
      }
    }

    if (sourceUrl && typeof sourceUrl === "string") {
      // sourceUrl is optionally provided for proof/verification
      // Can be logged or utilized for auditing
    }

    const mbid = getCanonicalAlbumMbid(cleanArtist, cleanTitle);

    const [upserted] = await db
      .insert(albums)
      .values({
        mbid,
        title: cleanTitle,
        artistName: cleanArtist,
        releaseYear: validYear,
        defaultCoverUrl: finalCoverUrl,
      })
      .onConflictDoUpdate({
        target: albums.mbid,
        set: {
          title: cleanTitle,
          artistName: cleanArtist,
          releaseYear: validYear,
          defaultCoverUrl: finalCoverUrl,
        },
      })
      .returning();

    return NextResponse.json({ album: upserted }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[catalog album register error]:", error);
    return NextResponse.json(
      { error: "Failed to register album" },
      { status: 500 }
    );
  }
}
