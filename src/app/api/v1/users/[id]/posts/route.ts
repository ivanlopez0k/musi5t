import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserVisiblePosts } from "@/lib/feed/visibility";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawTarget } = await params;
    const target = decodeURIComponent(rawTarget).trim();
    if (!target) {
      return NextResponse.json({ error: "Invalid user identifier" }, { status: 400 });
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
    const cleanUsername = target.replace(/^@/, "").toLowerCase();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        isUuid
          ? eq(users.id, target)
          : eq(sql`LOWER(${users.username})`, cleanUsername)
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser(request);
    const cursor = request.nextUrl.searchParams.get("cursor");
    const rawLimit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;

    const posts = await getUserVisiblePosts({
      profileUserId: user.id,
      viewerUserId: currentUser?.id || null,
      limit,
      cursor,
    });

    const nextCursor =
      posts.length >= limit ? posts[posts.length - 1].createdAt.toISOString() : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[users/:id/posts error]:", error);
    return NextResponse.json(
      { error: "Failed to load user discussions" },
      { status: 500 }
    );
  }
}
