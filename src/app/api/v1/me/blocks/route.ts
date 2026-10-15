import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { blocks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const blockedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        blockedAt: blocks.createdAt,
      })
      .from(blocks)
      .innerJoin(users, eq(blocks.blockedId, users.id))
      .where(eq(blocks.blockerId, user.id));

    return NextResponse.json({ blocks: blockedUsers });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[get blocks error]:", error);
    return NextResponse.json({ error: "Error al obtener lista de bloqueados." }, { status: 500 });
  }
}
