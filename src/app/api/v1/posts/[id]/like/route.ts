import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { postLikes, posts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, isNull } from "drizzle-orm";

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

    // Verify post exists and is not deleted
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    }

    await db
      .insert(postLikes)
      .values({
        postId,
        userId: user.id,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true, liked: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[like post error]:", error);
    return NextResponse.json({ error: "Error al dar like." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: postId } = await params;

    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));

    return NextResponse.json({ success: true, liked: false });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unlike post error]:", error);
    return NextResponse.json({ error: "Error al quitar like." }, { status: 500 });
  }
}
