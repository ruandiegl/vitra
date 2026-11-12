import { createHash, randomBytes } from "node:crypto";
import type { AuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/db";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAuthToken(userId: string, type: AuthTokenType, expiresInMs: number, newEmail?: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      newEmail,
      expiresAt: new Date(Date.now() + expiresInMs),
    },
  });
  return token;
}

export async function consumeAuthToken(token: string, type: AuthTokenType) {
  const tokenHash = hashToken(token);
  const record = await prisma.authToken.findFirst({
    where: { tokenHash, type, consumedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!record) return null;
  const claimed = await prisma.authToken.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  return claimed.count === 1 ? record : null;
}
