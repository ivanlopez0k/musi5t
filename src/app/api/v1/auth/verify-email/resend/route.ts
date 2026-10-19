import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createAccountToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para reenviar el email de verificación." },
        { status: 401 }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        message: "Tu cuenta ya se encuentra verificada.",
      });
    }

    const token = await createAccountToken({
      userId: user.id,
      type: "email_verification",
      expiresInHours: 24,
    });

    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Hemos enviado un nuevo enlace de verificación a tu casilla de correo.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[resend-verification error]:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo de verificación. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
