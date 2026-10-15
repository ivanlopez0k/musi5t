import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { mutes, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const mutedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        mutedAt: mutes.createdAt,
      })
      .from(mutes)
      .innerJoin(users, eq(mutes.mutedId, users.id))
      .where(eq(mutes.muterId, user.id));

    return NextResponse.json({ mutes: mutedUsers });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get mutes error]:", error);
    return NextResponse.json({ error: "Error al obtener lista de muteados." }, { status: 500 });
  }
}
