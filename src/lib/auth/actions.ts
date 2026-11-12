"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/sites/validation";
import { absoluteUrl } from "@/lib/utils";
import { issueAuthToken, consumeAuthToken } from "./tokens";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getRequestFingerprint, RateLimitError } from "@/lib/security/rate-limit";
import { getCurrentUser } from "./session";

export type AuthActionResult = { success: boolean; message: string; warning?: string };

const passwordSchema = z.string().min(8, "Use pelo menos 8 caracteres.").max(72, "Use no máximo 72 caracteres.").regex(/[A-Za-z]/, "Inclua pelo menos uma letra.").regex(/\d/, "Inclua pelo menos um número.");
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(160), password: passwordSchema });

async function sendVerification(userId: string, email: string) {
  const token = await issueAuthToken(userId, "VERIFY_EMAIL", 24 * 60 * 60 * 1000);
  const url = absoluteUrl(`/verificar-email?token=${encodeURIComponent(token)}`);
  await sendMail({ to: email, subject: "Confirme seu e-mail na Vitra", text: `Confirme seu e-mail em até 24 horas:\n${url}\n\nSe você não criou uma conta, ignore esta mensagem.` });
}

export async function registerAction(input: unknown): Promise<AuthActionResult> {
  try {
    checkRateLimit(`register:${await getRequestFingerprint()}`, 5, 60 * 60 * 1000);
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Revise os dados informados." };
    const email = parsed.data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return { success: false, message: "Já existe uma conta com este e-mail. Entre ou recupere sua senha." };
    }
    const plan = await prisma.plan.findFirst({ where: { isActive: true }, orderBy: { position: "asc" } });
    if (!plan) return { success: false, message: "Nenhum plano está disponível no momento. Tente novamente mais tarde." };
    const policy = process.env.ACCESS_POLICY ?? "TRIAL";
    const trialDays = Math.max(1, Math.min(30, Number(process.env.TRIAL_DAYS ?? 7)));
    const trialEndsAt = policy === "TRIAL" ? new Date(Date.now() + trialDays * 86400000) : null;
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name: parsed.data.name, email, passwordHash } });
      const workspace = await tx.workspace.create({ data: { name: `Espaço de ${parsed.data.name}`, slug: `${slugify(parsed.data.name) || "workspace"}-${randomBytes(3).toString("hex")}` } });
      await tx.membership.create({ data: { userId: created.id, workspaceId: workspace.id, role: "OWNER" } });
      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          planId: plan.id,
          status: policy === "PAID" ? "PENDING" : policy === "FREE" ? "ACTIVE" : "TRIAL",
          planNameSnapshot: policy === "FREE" ? "Acesso gratuito" : plan.name,
          amountCents: policy === "FREE" ? 0 : plan.priceCents,
          currency: plan.currency,
          interval: plan.interval,
          trialEndsAt,
          currentPeriodStart: policy === "PAID" ? null : new Date(),
          currentPeriodEnd: policy === "FREE" ? null : trialEndsAt,
        },
      });
      return created;
    });
    let warning: string | undefined;
    try { await sendVerification(user.id, email); } catch {
      warning = "A conta foi criada, mas o e-mail de confirmação não pôde ser enviado. Solicite um novo no painel.";
    }
    return { success: true, message: "Conta criada. Entrando no seu espaço…", warning };
  } catch (error) {
    if (error instanceof RateLimitError) return { success: false, message: error.message };
    console.error("registerAction", error);
    return { success: false, message: "Não foi possível criar a conta agora. Tente novamente." };
  }
}

export async function requestPasswordResetAction(input: unknown): Promise<AuthActionResult> {
  const parsed = z.object({ email: z.string().trim().email().max(160) }).safeParse(input);
  if (!parsed.success) return { success: false, message: "Informe um e-mail válido." };
  try {
    checkRateLimit(`reset:${await getRequestFingerprint()}`, 5, 60 * 60 * 1000);
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.status === "ACTIVE") {
      const token = await issueAuthToken(user.id, "RESET_PASSWORD", 60 * 60 * 1000);
      await sendMail({ to: email, subject: "Recupere sua senha na Vitra", text: `Redefina sua senha em até 1 hora:\n${absoluteUrl(`/recuperar-senha?token=${encodeURIComponent(token)}`)}\n\nSe não foi você, ignore esta mensagem.` }).catch((error) => console.error("reset email", error));
    }
    return { success: true, message: "Se houver uma conta com este e-mail, enviaremos as instruções de recuperação." };
  } catch (error) {
    if (error instanceof RateLimitError) return { success: false, message: error.message };
    return { success: false, message: "Não foi possível processar agora. Tente novamente." };
  }
}

export async function resetPasswordAction(input: unknown): Promise<AuthActionResult> {
  const parsed = z.object({ token: z.string().min(20), password: passwordSchema }).safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const token = await consumeAuthToken(parsed.data.token, "RESET_PASSWORD");
  if (!token) return { success: false, message: "Este link é inválido, expirou ou já foi usado. Solicite uma nova recuperação." };
  await prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), sessionVersion: { increment: 1 } } });
  return { success: true, message: "Senha alterada. Entre com a nova senha." };
}

export async function verifyEmailAction(tokenValue: string): Promise<AuthActionResult> {
  const parsed = z.string().min(20).safeParse(tokenValue);
  if (!parsed.success) return { success: false, message: "Link de confirmação inválido." };
  const token = await consumeAuthToken(tokenValue, "VERIFY_EMAIL");
  if (!token) return { success: false, message: "Este link é inválido, expirou ou já foi confirmado." };
  await prisma.user.update({ where: { id: token.userId }, data: { emailVerified: new Date() } });
  revalidatePath("/app");
  return { success: true, message: "E-mail confirmado. Você já pode publicar seu minisite." };
}

export async function resendVerificationAction(): Promise<AuthActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Entre novamente para continuar." };
  if (user.emailVerified) return { success: true, message: "Seu e-mail já está confirmado." };
  checkRateLimit(`verify:${user.id}`, 3, 60 * 60 * 1000);
  try {
    await sendVerification(user.id, user.email);
    return { success: true, message: "E-mail de confirmação enviado." };
  } catch {
    return { success: false, message: "Não foi possível enviar. Confira mais tarde ou contate o suporte." };
  }
}

export async function updatePasswordAction(input: unknown): Promise<AuthActionResult> {
  const parsed = z.object({ currentPassword: z.string(), newPassword: passwordSchema }).safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const user = await getCurrentUser();
  if (!user?.passwordHash) return { success: false, message: "Entre novamente para alterar a senha." };
  if (!await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)) return { success: false, message: "A senha atual não confere." };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12), sessionVersion: { increment: 1 } } });
  return { success: true, message: "Senha alterada. Entre novamente com a nova senha." };
}
