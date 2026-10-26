import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    let notificationId: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.notificationId === "string") {
        notificationId = body.notificationId;
      }
    } catch {
      // Body is optional; empty payload marks all as read
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.recipientId, user.id)
          )
        );
    } else {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.recipientId, user.id),
            eq(notifications.read, false)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[mark notifications read error]:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificaciones." },
      { status: 500 }
    );
  }
}
