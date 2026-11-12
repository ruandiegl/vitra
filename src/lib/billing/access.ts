import type { Subscription } from "@prisma/client";

export type AccessState = {
  canEdit: boolean;
  canPublish: boolean;
  canReceiveVisitors: boolean;
  label: string;
  detail: string;
};

export function getAccessState(subscription: Subscription | null, now = new Date()): AccessState {
  if (!subscription) return { canEdit: true, canPublish: false, canReceiveVisitors: false, label: "Sem assinatura", detail: "Escolha um plano para publicar." };
  const end = subscription.currentPeriodEnd?.getTime() ?? 0;
  const trialEnd = subscription.trialEndsAt?.getTime() ?? 0;
  const graceEnd = subscription.gracePeriodEndsAt?.getTime() ?? 0;
  const timestamp = now.getTime();

  if (subscription.status === "PENDING") {
    return { canEdit: true, canPublish: false, canReceiveVisitors: false, label: "Pagamento pendente", detail: "Você pode preparar seu site. A publicação é liberada após a confirmação do provedor." };
  }
  if (subscription.status === "TRIAL" && trialEnd > timestamp) {
    return { canEdit: true, canPublish: true, canReceiveVisitors: true, label: "Teste grátis", detail: `Teste válido até ${subscription.trialEndsAt?.toLocaleDateString("pt-BR")}.` };
  }
  if (subscription.status === "ACTIVE" && (!end || end > timestamp)) {
    return { canEdit: true, canPublish: true, canReceiveVisitors: true, label: subscription.cancelAtPeriodEnd ? "Cancelamento agendado" : "Assinatura ativa", detail: subscription.cancelAtPeriodEnd ? "O acesso permanece até o fim do período pago." : "Todos os recursos do seu plano estão disponíveis." };
  }
  if (subscription.status === "PAST_DUE" && graceEnd > timestamp) {
    return { canEdit: true, canPublish: false, canReceiveVisitors: true, label: "Pagamento em atraso", detail: "Regularize o pagamento para publicar alterações. Seu site segue no ar durante a tolerância." };
  }
  if (subscription.status === "CANCELED" && end > timestamp) {
    return { canEdit: true, canPublish: false, canReceiveVisitors: true, label: "Assinatura cancelada", detail: "O acesso continua até o fim do período já pago." };
  }
  return { canEdit: false, canPublish: false, canReceiveVisitors: false, label: "Acesso expirado", detail: "Reative sua assinatura para editar e publicar. Seus dados continuam preservados." };
}

export function addInterval(from: Date, interval: "MONTHLY" | "YEARLY") {
  const result = new Date(from);
  if (interval === "MONTHLY") result.setMonth(result.getMonth() + 1);
  else result.setFullYear(result.getFullYear() + 1);
  return result;
}
