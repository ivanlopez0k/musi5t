import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const ALLOWED_THEMES = ["lima", "coral", "cobalto", "violeta", "mandarina"];

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.themeKey !== undefined) {
      if (!ALLOWED_THEMES.includes(body.themeKey)) {
        return NextResponse.json(
          { error: `Paleta inválida. Debe ser una de: ${ALLOWED_THEMES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.themeKey = body.themeKey;
    }

    if (body.displayName !== undefined) {
      if (typeof body.displayName !== "string" || body.displayName.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre a mostrar no puede estar vacío." },
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
