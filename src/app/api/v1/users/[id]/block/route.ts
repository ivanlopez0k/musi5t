import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { blocks, follows, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, or } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id: targetId } = await params;
    if (user.id === targetId) {
      return NextResponse.json(
        { error: "No podés bloquearte a vos mismo." },
        { status: 400 }
      );
    }

    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Atomically remove follows in both directions and insert block
    await db.transaction(async (tx) => {
      await tx
        .delete(follows)
        .where(
          or(
            and(eq(follows.followerId, user.id), eq(follows.followeeId, targetId)),
            and(eq(follows.followerId, targetId), eq(follows.followeeId, user.id))
          )
        );

      await tx
        .insert(blocks)
        .values({
          blockerId: user.id,
          blockedId: targetId,
        })
        .onConflictDoNothing();
    });

    return NextResponse.json({ success: true, blocked: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[block user error]:", error);
    return NextResponse.json({ error: "Error al bloquear al usuario." }, { status: 500 });
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

    const { id: targetId } = await params;

    await db
      .delete(blocks)
      .where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, targetId)));

    return NextResponse.json({ success: true, blocked: false });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unblock user error]:", error);
    return NextResponse.json({ error: "Error al desbloquear al usuario." }, { status: 500 });
  }
}
