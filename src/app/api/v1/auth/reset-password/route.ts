import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { verifyAndConsumeAccountToken } from "@/lib/auth/tokens";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token de recuperación no provisto o inválido." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe contener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const verification = await verifyAndConsumeAccountToken({
      rawToken: token,
      type: "password_reset",
    });

    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { error: verification.error || "Token inválido o expirado." },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(password);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, verification.userId));

    return NextResponse.json({
      success: true,
      message:
        "Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[reset-password error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al restablecer la contraseña." },
      { status: 500 }
    );
  }
}
