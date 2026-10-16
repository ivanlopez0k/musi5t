import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, isNull } from "drizzle-orm";

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

    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este post." },
        { status: 403 }
      );
    }

    await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete post error]:", error);
    return NextResponse.json(
      { error: "Error al eliminar el post." },
      { status: 500 }
    );
  }
}
