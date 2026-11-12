"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { addInterval } from "./access";
import { getPaymentProvider, isDevelopmentPaymentProvider } from "./provider";
import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth/session";
import { absoluteUrl, formatMoney } from "@/lib/utils";

export type BillingResult = { success: boolean; message: string; checkoutUrl?: string; paymentId?: string };

async function calculateDiscount(planId: string, workspaceId: string, code?: string) {
  if (!code?.trim()) return { couponId: null, discountCents: 0 };
  const coupon = await prisma.coupon.findFirst({ where: { code: code.trim().toUpperCase(), isActive: true }, include: { plans: true, redemptions: { where: { workspaceId } }, _count: { select: { redemptions: true } } } });
  const now = new Date();
  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now) || (coupon.maxRedemptions !== null && coupon._count.redemptions >= coupon.maxRedemptions) || coupon.redemptions.length >= coupon.perWorkspaceLimit || (coupon.plans.length > 0 && !coupon.plans.some((plan) => plan.planId === planId))) throw new Error("Cupom inválido, expirado ou não aplicável a este plano.");
  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId }, select: { priceCents: true } });
  const discountCents = coupon.discountType === "PERCENTAGE" ? Math.min(plan.priceCents, Math.round(plan.priceCents * coupon.discountValue / 100)) : Math.min(plan.priceCents, coupon.discountValue);
  return { couponId: coupon.id, discountCents };
}

export async function createCheckoutAction(input: { planId: string; couponCode?: string }): Promise<BillingResult> {
  try {
    const { membership } = await requireWorkspace("/app/assinatura");
    if (process.env.NODE_ENV === "production" && isDevelopmentPaymentProvider()) return { success: false, message: "O checkout de desenvolvimento está desabilitado em produção. Configure um gateway real." };
    const provider = getPaymentProvider();
    const [plan, subscription] = await Promise.all([prisma.plan.findFirst({ where: { id: input.planId, isActive: true } }), prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId } })]);
    if (!plan || !subscription) return { success: false, message: "Plano ou assinatura não encontrado." };
    const { couponId, discountCents } = await calculateDiscount(plan.id, membership.workspaceId, input.couponCode);
    const payment = await prisma.payment.create({ data: { subscriptionId: subscription.id, planId: plan.id, couponId, provider: provider.name, providerPaymentId: `dev_${randomUUID()}`, description: `Assinatura ${plan.name} · ${plan.interval === "MONTHLY" ? "mensal" : "anual"}`, amountCents: plan.priceCents - discountCents, discountCents, currency: plan.currency, status: "PENDING" } });
    const checkoutUrl = await provider.createCheckout(payment);
    await prisma.payment.update({ where: { id: payment.id }, data: { checkoutUrl } });
    return { success: true, message: "Checkout criado.", checkoutUrl, paymentId: payment.id };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Não foi possível iniciar o checkout." }; }
}

export async function simulateDevelopmentPaymentAction(paymentId: string): Promise<BillingResult> {
  if (process.env.NODE_ENV === "production" || !isDevelopmentPaymentProvider()) return { success: false, message: "Esta confirmação só existe no ambiente de desenvolvimento." };
  try {
    const { membership, user } = await requireWorkspace("/app/assinatura");
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, provider: "development", subscription: { workspaceId: membership.workspaceId } }, include: { plan: true, coupon: true } });
    if (!payment) return { success: false, message: "Pagamento de desenvolvimento não encontrado." };
    const eventId = `dev-payment-confirmed:${payment.id}`;
    await prisma.$transaction(async (tx) => {
      const existingEvent = await tx.paymentEvent.findUnique({ where: { providerEventId: eventId } });
      if (existingEvent?.processedAt) return;
      await tx.paymentEvent.upsert({ where: { providerEventId: eventId }, create: { provider: "development", providerEventId: eventId, eventType: "payment.confirmed", payloadHash: createHash("sha256").update(payment.id).digest("hex") }, update: {} });
      const claimed = await tx.payment.updateMany({ where: { id: payment.id, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
      if (!claimed.count) { await tx.paymentEvent.update({ where: { providerEventId: eventId }, data: { processedAt: new Date() } }); return; }
      const plan = payment.plan ?? await tx.plan.findUnique({ where: { id: payment.planId! } });
      if (!plan) throw new Error("O plano deste pagamento não está mais disponível.");
      const now = new Date();
      await tx.subscription.update({ where: { id: payment.subscriptionId }, data: { planId: plan.id, planNameSnapshot: plan.name, amountCents: plan.priceCents, currency: plan.currency, interval: plan.interval, status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd: addInterval(now, plan.interval), trialEndsAt: null, gracePeriodEndsAt: null, cancelAtPeriodEnd: false, canceledAt: null, providerSubscriptionId: `dev_sub_${membership.workspaceId}` } });
      if (payment.couponId) await tx.couponRedemption.create({ data: { couponId: payment.couponId, workspaceId: membership.workspaceId } });
      await tx.paymentEvent.update({ where: { providerEventId: eventId }, data: { processedAt: new Date() } });
      await tx.auditLog.create({ data: { actorUserId: user.id, workspaceId: membership.workspaceId, action: "billing.payment_confirmed", entityType: "Payment", entityId: payment.id, metadata: { provider: "development", planId: plan.id, amountCents: payment.amountCents } } });
    });
    revalidatePath("/app/assinatura"); revalidatePath("/app");
    return { success: true, message: `Pagamento de desenvolvimento confirmado: ${formatMoney(payment.amountCents)}.`, paymentId };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Não foi possível confirmar o pagamento local." }; }
}

export async function cancelSubscriptionAction(): Promise<BillingResult> {
  try {
    const { membership, user } = await requireWorkspace("/app/assinatura");
    const subscription = await prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId } });
    if (!subscription) return { success: false, message: "Assinatura não encontrada." };
    await getPaymentProvider().cancel(subscription);
    const end = subscription.currentPeriodEnd ?? subscription.trialEndsAt ?? new Date();
    await prisma.$transaction([prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELED", cancelAtPeriodEnd: true, canceledAt: new Date(), currentPeriodEnd: end } }), prisma.auditLog.create({ data: { actorUserId: user.id, workspaceId: membership.workspaceId, action: "billing.cancellation_requested", entityType: "Subscription", entityId: subscription.id, metadata: { accessUntil: end } } })]);
    revalidatePath("/app/assinatura"); revalidatePath("/app");
    return { success: true, message: `Cancelamento registrado. Seu acesso permanece até ${end.toLocaleDateString("pt-BR")}, conforme o período disponível.` };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Não foi possível cancelar agora." }; }
}

export async function reactivateSubscriptionAction(): Promise<BillingResult> {
  const { membership } = await requireWorkspace("/app/assinatura");
  const subscription = await prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId } });
  if (!subscription) return { success: false, message: "Assinatura não encontrada." };
  const trialValid = subscription.trialEndsAt && subscription.trialEndsAt > new Date();
  const periodValid = subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date();
  if (!trialValid && !periodValid) return { success: false, message: "O período contratado terminou. Escolha um plano para iniciar uma nova assinatura." };
  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: trialValid ? "TRIAL" : "ACTIVE", cancelAtPeriodEnd: false, canceledAt: null } });
  revalidatePath("/app/assinatura");
  return { success: true, message: "Assinatura reativada." };
}
