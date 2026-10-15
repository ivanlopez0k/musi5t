import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeedPosts } from "@/lib/feed/visibility";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const typeParam = request.nextUrl.searchParams.get("type");
    const type = typeParam === "global" ? "global" : "for-you";
    const cursor = request.nextUrl.searchParams.get("cursor");

    // If unauthenticated and requesting for-you, fallback to global
    const effectiveType = !user && type === "for-you" ? "global" : type;

    const posts = await getFeedPosts({
      userId: user?.id || null,
      type: effectiveType,
      cursor,
      limit: 20,
    });

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    return NextResponse.json({
      type: effectiveType,
      posts,
      nextCursor,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[feed error]:", error);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
