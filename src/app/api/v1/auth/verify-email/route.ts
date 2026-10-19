import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyAndConsumeAccountToken } from "@/lib/auth/tokens";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Token de verificación no proporcionado." },
        { status: 400 }
      );
    }

    const verification = await verifyAndConsumeAccountToken({
      rawToken: token,
      type: "email_verification",
    });

    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { error: verification.error || "Token inválido o expirado." },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, verification.userId));

    return NextResponse.json({
      success: true,
      message: "Tu dirección de correo ha sido verificada exitosamente.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[verify-email error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al verificar el correo electrónico." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token de verificación no proporcionado." },
        { status: 400 }
      );
    }

    const verification = await verifyAndConsumeAccountToken({
      rawToken: token,
      type: "email_verification",
    });

    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { error: verification.error || "Token inválido o expirado." },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, verification.userId));

    return NextResponse.json({
      success: true,
      message: "Tu dirección de correo ha sido verificada exitosamente.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[verify-email error]:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al verificar el correo electrónico." },
      { status: 500 }
    );
  }
}
