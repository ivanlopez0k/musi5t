import crypto from "node:crypto";
import { db, ensureAccountTokenTables } from "@/db";
import { accountTokens } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export type AccountTokenType = "email_verification" | "password_reset";

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function createAccountToken({
  userId,
  type,
  expiresInHours,
}: {
  userId: string;
  type: AccountTokenType;
  expiresInHours?: number;
}): Promise<string> {
  await ensureAccountTokenTables();

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const durationHours = expiresInHours ?? (type === "email_verification" ? 24 : 1);
  const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);

  // Invalidate any previous unused tokens for this user and type
  await db
    .update(accountTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(accountTokens.userId, userId),
        eq(accountTokens.type, type),
        isNull(accountTokens.usedAt)
      )
    );

  // Insert the fresh token
  await db.insert(accountTokens).values({
    userId,
    tokenHash,
    type,
    expiresAt,
  });

  return rawToken;
}

export async function verifyAndConsumeAccountToken({
  rawToken,
  type,
}: {
  rawToken: string;
  type: AccountTokenType;
}): Promise<{ valid: boolean; userId?: string; error?: string }> {
  await ensureAccountTokenTables();

  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length === 0) {
    return { valid: false, error: "Token no provisto o inválido." };
  }

  const tokenHash = hashToken(rawToken.trim());

  const [record] = await db
    .select({
      id: accountTokens.id,
      userId: accountTokens.userId,
      expiresAt: accountTokens.expiresAt,
      usedAt: accountTokens.usedAt,
    })
    .from(accountTokens)
    .where(
      and(
        eq(accountTokens.tokenHash, tokenHash),
        eq(accountTokens.type, type),
        isNull(accountTokens.usedAt)
      )
    )
    .limit(1);

  if (!record) {
    return {
      valid: false,
      error: "El enlace es inválido o ya ha sido utilizado previamente.",
    };
  }

  if (new Date() > record.expiresAt) {
    return {
      valid: false,
      error: "El enlace ha expirado. Por favor solicita uno nuevo.",
    };
  }

  // Burn the token immediately
  await db
    .update(accountTokens)
    .set({ usedAt: new Date() })
    .where(eq(accountTokens.id, record.id));

  return { valid: true, userId: record.userId };
}
