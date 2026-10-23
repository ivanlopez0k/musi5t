import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createAccountToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/mailer";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, cleanEmail))
      .limit(1);

    if (user) {
      const token = await createAccountToken({
        userId: user.id,
        type: "password_reset",
        expiresInHours: 1,
      });

      await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        token,
      });
    }

    // Always return generic success response to mitigate timing and enumeration attacks
    return NextResponse.json({
      success: true,
      message:
        "Si la dirección ingresada coincide con una cuenta activa, recibirás un correo con las instrucciones para restablecer tu contraseña en los próximos minutos.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[forgot-password error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar la solicitud." },
      { status: 500 }
    );
  }
}
