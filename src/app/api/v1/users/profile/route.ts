import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const THEME_KEY_MAP: Record<string, string> = {
  lime: "lima",
  cobalt: "cobalto",
  violet: "violeta",
  tangerine: "mandarina",
  obsidian: "obsidiana",
  forest: "bosque",
  "forest green": "bosque",
};

const ALLOWED_THEMES = [
  "lima", "coral", "cobalto", "violeta", "mandarina", "obsidiana", "bosque",
  "lime", "cobalt", "violet", "tangerine", "obsidian", "forest", "forest green",
];
const VERIFIED_ONLY_THEMES = ["obsidiana", "bosque", "obsidian", "forest", "forest green"];

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.themeKey !== undefined) {
      const normalizedTheme = String(body.themeKey).toLowerCase().trim();
      if (!ALLOWED_THEMES.includes(normalizedTheme)) {
        return NextResponse.json(
          { error: "Invalid palette theme selected." },
          { status: 400 }
        );
      }

      if (VERIFIED_ONLY_THEMES.includes(normalizedTheme) && !user.emailVerifiedAt) {
        return NextResponse.json(
          { error: "Verify your email to unlock this exclusive palette." },
          { status: 403 }
        );
      }

      // Store canonical key
      updateData.themeKey = THEME_KEY_MAP[normalizedTheme] || normalizedTheme;
    }

    if (body.displayName !== undefined) {
      if (typeof body.displayName !== "string" || body.displayName.trim().length === 0) {
        return NextResponse.json(
          { error: "Display name cannot be empty." },
          { status: 400 }
        );
      }
      updateData.displayName = body.displayName.trim().slice(0, 60);
    }

    if (body.bio !== undefined) {
      updateData.bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 250) : null;
    }

    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : null;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        themeKey: users.themeKey,
        createdAt: users.createdAt,
      });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[profile update error]:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el perfil." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    await db.delete(users).where(eq(users.id, user.id));
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[profile delete error]:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar la cuenta." },
      { status: 500 }
    );
  }
}

