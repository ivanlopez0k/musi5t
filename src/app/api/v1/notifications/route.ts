import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { notifications, users, posts, postReplies } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, count, desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const [unreadResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.recipientId, user.id), eq(notifications.read, false)));

    const unreadCount = Number(unreadResult?.count ?? 0);

    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        read: notifications.read,
        createdAt: notifications.createdAt,
        postId: notifications.postId,
        replyId: notifications.replyId,
        actorId: users.id,
        actorUsername: users.username,
        actorDisplayName: users.displayName,
        actorAvatarUrl: users.avatarUrl,
        actorThemeKey: users.themeKey,
        postBody: posts.body,
        replyBody: postReplies.body,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .leftJoin(posts, eq(notifications.postId, posts.id))
      .leftJoin(postReplies, eq(notifications.replyId, postReplies.id))
      .where(eq(notifications.recipientId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const formattedNotifications = rows.map((r) => {
      const postPreview = r.postBody
        ? r.postBody.length > 80
          ? `${r.postBody.slice(0, 77)}...`
          : r.postBody
        : null;

      const replyPreview = r.replyBody
        ? r.replyBody.length > 80
          ? `${r.replyBody.slice(0, 77)}...`
          : r.replyBody
        : null;

      return {
        id: r.id,
        type: r.type,
        read: r.read,
        createdAt: r.createdAt.toISOString(),
        postId: r.postId,
        replyId: r.replyId,
        actor: {
          id: r.actorId,
          username: r.actorUsername,
          displayName: r.actorDisplayName,
          avatarUrl: r.actorAvatarUrl,
          themeKey: r.actorThemeKey,
        },
        postPreview,
        replyPreview,
      };
    });

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get notifications error]:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones." },
      { status: 500 }
    );
  }
}
