import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { posts, postAlbums, albums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { body: textBody, isPublic, albumIds = [] } = body;

    // Validate body length
    if (!textBody || typeof textBody !== "string" || textBody.trim().length === 0) {
      return NextResponse.json(
        { error: "El contenido del post no puede estar vacío." },
        { status: 400 }
      );
    }

    const trimmedBody = textBody.trim();
    if (trimmedBody.length > 500) {
      return NextResponse.json(
        { error: "El post no puede superar los 500 caracteres." },
        { status: 400 }
      );
    }

    // Validate albums
    if (!Array.isArray(albumIds) || albumIds.length > 3) {
      return NextResponse.json(
        { error: "Podés asociar un máximo de 3 álbumes por post." },
        { status: 400 }
      );
    }

    const isPub = Boolean(isPublic);

    // Validate audience rule (must be public OR tagged to at least 1 album)
    if (!isPub && albumIds.length === 0) {
      return NextResponse.json(
        { error: "Debés seleccionar al menos una audiencia (#public o al menos un #álbum)." },
        { status: 400 }
      );
    }

    // Verify albums exist in DB
    let validAlbumIds: string[] = [];
    if (albumIds.length > 0) {
      const existingAlbums = await db
        .select({ id: albums.id })
        .from(albums)
        .where(inArray(albums.id, albumIds));
      validAlbumIds = existingAlbums.map((a) => a.id);
    }

    // Insert post and postAlbums atomically
    const newPost = await db.transaction(async (tx) => {
      const [p] = await tx
        .insert(posts)
        .values({
          authorId: user.id,
          body: trimmedBody,
          isPublic: isPub,
        })
        .returning();

      if (validAlbumIds.length > 0) {
        await tx.insert(postAlbums).values(
          validAlbumIds.map((albId) => ({
            postId: p.id,
            albumId: albId,
          }))
        );
      }

      return p;
    });

    return NextResponse.json({
      post: {
        id: newPost.id,
        body: newPost.body,
        isPublic: newPost.isPublic,
        createdAt: newPost.createdAt,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          themeKey: user.themeKey,
        },
        albumIds: validAlbumIds,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[create post error]:", error);
    return NextResponse.json(
      { error: "Error al publicar el post." },
      { status: 500 }
    );
  }
}
