import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { follows, blocks, notifications, users } from "@/db/schema";
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
        { error: "No puedes seguirte a ti mismo." },
        { status: 400 }
      );
    }

    // Verify target user exists
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Check if blocked in either direction
    const [block] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, targetId)),
          and(eq(blocks.blockerId, targetId), eq(blocks.blockedId, user.id))
        )
      )
      .limit(1);

    if (block) {
      return NextResponse.json(
        { error: "No se puede seguir a este usuario debido a un bloqueo." },
        { status: 403 }
      );
    }

    const inserted = await db
      .insert(follows)
      .values({
        followerId: user.id,
        followeeId: targetId,
      })
      .onConflictDoNothing()
      .returning({ followerId: follows.followerId });

    if (inserted.length > 0 && targetId !== user.id) {
      await db.insert(notifications).values({
        recipientId: targetId,
        actorId: user.id,
        type: "follow",
      });
    }

    return NextResponse.json({ success: true, following: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[follow user error]:", error);
    return NextResponse.json(
      { error: "Error al seguir al usuario." },
      { status: 500 }
    );
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

    const deleted = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followeeId, targetId)
        )
      )
      .returning({ followerId: follows.followerId });

    if (deleted.length > 0) {
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.recipientId, targetId),
            eq(notifications.actorId, user.id),
            eq(notifications.type, "follow")
          )
        );
    }

    return NextResponse.json({ success: true, following: false });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unfollow user error]:", error);
    return NextResponse.json(
      { error: "Error al dejar de seguir al usuario." },
      { status: 500 }
    );
  }
}
