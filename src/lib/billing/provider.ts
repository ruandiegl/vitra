import type { Payment, Subscription } from "@prisma/client";
import { absoluteUrl } from "@/lib/utils";

export interface PaymentProvider {
  readonly name: string;
  createCheckout(payment: Payment): Promise<string>;
  cancel(subscription: Subscription): Promise<void>;
}

/** Driver isolado de desenvolvimento: nunca movimenta dinheiro nem representa um gateway real. */
class DevelopmentPaymentProvider implements PaymentProvider {
  readonly name = "development";
  async createCheckout(payment: Payment) { return absoluteUrl(`/app/assinatura/checkout/${payment.id}`); }
  async cancel() { /* O driver local não possui cobrança externa a cancelar. */ }
}

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "development";
  if (name === "development") return new DevelopmentPaymentProvider();
  throw new Error(`O provedor de pagamento “${name}” ainda não foi configurado nesta instalação.`);
}

export function isDevelopmentPaymentProvider() { return (process.env.PAYMENT_PROVIDER ?? "development") === "development"; }
