import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { eq, or, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Completá todos los campos requeridos." },
        { status: 400 }
      );
    }

    const cleanIdentifier = (identifier as string).trim().toLowerCase();

    // Find by email or username
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        themeKey: users.themeKey,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      })
      .from(users)
      .where(
        or(
          eq(sql`LOWER(${users.email})`, cleanIdentifier),
          eq(sql`LOWER(${users.username})`, cleanIdentifier)
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    await setSessionCookie({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        themeKey: user.themeKey,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("[login error]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
