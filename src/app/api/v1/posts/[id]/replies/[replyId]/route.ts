import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { postReplies } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, isNull } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: postId, replyId } = await params;

    const [reply] = await db
      .select({
        id: postReplies.id,
        authorId: postReplies.authorId,
      })
      .from(postReplies)
      .where(
        and(
          eq(postReplies.id, replyId),
          eq(postReplies.postId, postId),
          isNull(postReplies.deletedAt)
        )
      )
      .limit(1);

    if (!reply) {
      return NextResponse.json(
        { error: "Respuesta no encontrada." },
        { status: 404 }
      );
    }

    if (reply.authorId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta respuesta." },
        { status: 403 }
      );
    }

    await db
      .update(postReplies)
      .set({ deletedAt: new Date() })
      .where(eq(postReplies.id, replyId));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[delete reply error]:", error);
    return NextResponse.json(
      { error: "Error al eliminar la respuesta." },
      { status: 500 }
    );
  }
}
