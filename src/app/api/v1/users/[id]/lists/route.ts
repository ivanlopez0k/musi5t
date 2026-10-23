import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getListsFeed } from "@/lib/lists/service";
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
    const isOwner = currentUser?.id === user.id;

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 50;

    const lists = await getListsFeed({
      userId: user.id,
      includePrivate: isOwner,
      limit,
    });

    return NextResponse.json({ lists });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[user lists error]:", error);
    return NextResponse.json(
      { error: "Failed to load user lists" },
      { status: 500 }
    );
  }
}
