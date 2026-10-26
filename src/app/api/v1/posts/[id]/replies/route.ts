import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { blocks, notifications, postReplies, posts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, isNull, or, sql } from "drizzle-orm";

async function canAccessPost(postId: string, viewerUserId: string | null) {
  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      isPublic: posts.isPublic,
      deletedAt: posts.deletedAt,
    })
    .from(posts)
    .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
    .limit(1);

  if (!post) return null;

  if (viewerUserId) {
    const [blockRecord] = await db
      .select({ blockerId: blocks.blockerId })
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, viewerUserId), eq(blocks.blockedId, post.authorId)),
          and(eq(blocks.blockerId, post.authorId), eq(blocks.blockedId, viewerUserId))
        )
      )
      .limit(1);

    if (blockRecord) return null;
  }

  return post;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const { id: postId } = await params;

    const parentPost = await canAccessPost(postId, user?.id || null);
    if (!parentPost) {
      return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    }

    const me = user?.id || null;

    const rows = await db.execute<{
      id: string;
      post_id: string;
      body: string;
      created_at: string;
      author_id: string;
      author_username: string;
      author_display_name: string;
      author_avatar_url: string | null;
      author_theme_key: string;
    }>(sql`
      SELECT
        pr.id,
        pr.post_id,
        pr.body,
        pr.created_at,
        u.id AS author_id,
        u.username AS author_username,
        u.display_name AS author_display_name,
        u.avatar_url AS author_avatar_url,
        u.theme_key AS author_theme_key
      FROM post_replies pr
      JOIN users u ON u.id = pr.author_id
      WHERE pr.post_id = ${postId}::uuid
        AND pr.deleted_at IS NULL
        ${
          me
            ? sql`
              AND NOT EXISTS (
                SELECT 1 FROM blocks b
                WHERE (b.blocker_id = ${me}::uuid AND b.blocked_id = pr.author_id)
                   OR (b.blocker_id = pr.author_id AND b.blocked_id = ${me}::uuid)
              )
              AND NOT EXISTS (
                SELECT 1 FROM mutes m
                WHERE m.muter_id = ${me}::uuid AND m.muted_id = pr.author_id
              )
            `
            : sql``
        }
      ORDER BY pr.created_at ASC;
    `);

    const replies = rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      body: r.body,
      createdAt: new Date(r.created_at).toISOString(),
      author: {
        id: r.author_id,
        username: r.author_username,
        displayName: r.author_display_name,
        avatarUrl: r.author_avatar_url,
        themeKey: r.author_theme_key,
      },
    }));

    return NextResponse.json({ replies });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get post replies error]:", error);
    return NextResponse.json(
      { error: "Error al cargar las respuestas." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: postId } = await params;

    const parentPost = await canAccessPost(postId, user.id);
    if (!parentPost) {
      return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    }

    const reqBody = await request.json();
    const bodyText = typeof reqBody.body === "string" ? reqBody.body.trim() : "";

    if (!bodyText || bodyText.length > 500) {
      return NextResponse.json(
        { error: "La respuesta debe tener entre 1 y 500 caracteres." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(postReplies)
      .values({
        postId,
        authorId: user.id,
        body: bodyText,
      })
      .returning();

    if (parentPost.authorId !== user.id) {
      await db.insert(notifications).values({
        recipientId: parentPost.authorId,
        actorId: user.id,
        type: "reply",
        postId: parentPost.id,
        replyId: created.id,
      });
    }

    return NextResponse.json(
      {
        reply: {
          id: created.id,
          postId: created.postId,
          body: created.body,
          createdAt: created.createdAt.toISOString(),
          author: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            themeKey: user.themeKey,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[create post reply error]:", error);
    return NextResponse.json(
      { error: "Error al publicar la respuesta." },
      { status: 500 }
    );
  }
}
