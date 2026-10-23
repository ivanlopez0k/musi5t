import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { createAccountToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { eq, or, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, displayName } = body;

    // Basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido o no provisto." },
        { status: 400 }
      );
    }

    if (!username || typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "El nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const finalDisplayName = (displayName && typeof displayName === "string" ? displayName.trim() : cleanUsername);

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(
        or(
          eq(sql`LOWER(${users.email})`, cleanEmail),
          eq(sql`LOWER(${users.username})`, cleanUsername)
        )
      )
      .limit(1);

    if (existing) {
      if (existing.email.toLowerCase() === cleanEmail) {
        return NextResponse.json(
          { error: "Ya existe una cuenta registrada con este email." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        username: cleanUsername,
        displayName: finalDisplayName,
        passwordHash,
        themeKey: "lima",
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        themeKey: users.themeKey,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      });

    await setSessionCookie({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    try {
      const verificationToken = await createAccountToken({
        userId: newUser.id,
        type: "email_verification",
        expiresInHours: 24,
      });
      await sendVerificationEmail({
        to: newUser.email,
        username: newUser.username,
        token: verificationToken,
      });
    } catch (mailErr) {
      console.error("[register verification mail error]:", mailErr);
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("[register error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al crear la cuenta." },
      { status: 500 }
    );
  }
}
