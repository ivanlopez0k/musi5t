import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { mutes, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

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
        { error: "No podés mutearte a vos mismo." },
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

    await db
      .insert(mutes)
      .values({
        muterId: user.id,
        mutedId: targetId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true, muted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[mute user error]:", error);
    return NextResponse.json({ error: "Error al mutear al usuario." }, { status: 500 });
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
      .delete(mutes)
      .where(and(eq(mutes.muterId, user.id), eq(mutes.mutedId, targetId)));

    return NextResponse.json({ success: true, muted: false });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[unmute user error]:", error);
    return NextResponse.json({ error: "Error al desmutear al usuario." }, { status: 500 });
  }
}
