"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldError, Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cancelSubscriptionAction, createCheckoutAction, reactivateSubscriptionAction, simulateDevelopmentPaymentAction } from "@/lib/billing/actions";
import { formatMoney } from "@/lib/utils";

export type CheckoutPlan = { id: string; name: string; description: string; priceCents: number; currency: string; interval: "MONTHLY" | "YEARLY"; features: unknown };
export function PlanChooser({ plans, currentPlanId }: { plans: CheckoutPlan[]; currentPlanId?: string }) {
  const router = useRouter(); const { toast } = useToast(); const [loading, setLoading] = useState(""); const [coupon, setCoupon] = useState(""); const [error, setError] = useState("");
  async function checkout(planId: string) { setLoading(planId); setError(""); const result = await createCheckoutAction({ planId, couponCode: coupon }); setLoading(""); if (!result.success || !result.checkoutUrl) { setError(result.message); return; } router.push(result.checkoutUrl); }
  return <div><div className="mb-5 max-w-sm"><Label htmlFor="coupon">Cupom (opcional)</Label><Input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Ex.: BEMVINDO10" /><span className="field-help">O desconto é validado novamente no servidor antes da cobrança.</span></div><FieldError>{error}</FieldError><div className="grid gap-4 md:grid-cols-3">{plans.map((plan) => { const features = Array.isArray(plan.features) ? plan.features.filter((item): item is string => typeof item === "string") : []; return <article key={plan.id} className={`rounded-2xl border p-5 ${plan.id === currentPlanId ? "border-primary bg-sky/40" : "border-border bg-white"}`}><div className="flex items-center justify-between"><h3 className="font-display text-xl font-semibold">{plan.name}</h3>{plan.id === currentPlanId ? <Check className="size-5 text-primary" /> : null}</div><p className="mt-2 text-sm text-muted">{plan.description}</p><p className="mt-4 font-display text-3xl font-semibold">{formatMoney(plan.priceCents, plan.currency)}<span className="font-sans text-xs font-normal text-muted">/{plan.interval === "MONTHLY" ? "mês" : "ano"}</span></p><ul className="my-5 space-y-2 text-sm">{features.slice(0, 4).map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}</ul><Button className="w-full" variant={plan.id === currentPlanId ? "secondary" : "default"} onClick={() => checkout(plan.id)} loading={loading === plan.id}><CreditCard />{plan.id === currentPlanId ? "Renovar ou alterar ciclo" : "Escolher plano"}</Button></article>; })}</div></div>;
}

export function CancelSubscriptionDialog({ canceled }: { canceled: boolean }) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false);
  async function action() { setLoading(true); const result = canceled ? await reactivateSubscriptionAction() : await cancelSubscriptionAction(); setLoading(false); toast({ title: result.success ? "Assinatura atualizada" : "Ação não realizada", description: result.message, tone: result.success ? "success" : "error" }); if (result.success) { setOpen(false); router.refresh(); } }
  if (canceled) return <Button variant="secondary" onClick={action} loading={loading}><RotateCcw />Reativar assinatura</Button>;
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" className="text-danger"><XCircle />Solicitar cancelamento</Button></DialogTrigger><DialogContent><DialogTitle>Cancelar sua assinatura?</DialogTitle><DialogDescription>Você continuará com acesso até o fim do período já pago ou do teste. Seus minisites e versões serão preservados; novas publicações serão bloqueadas após o encerramento.</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)}>Manter assinatura</Button><Button variant="danger" onClick={action} loading={loading}>Confirmar cancelamento</Button></div></DialogContent></Dialog>;
}

export function DevelopmentCheckoutButton({ paymentId }: { paymentId: string }) {
  const router = useRouter(); const { toast } = useToast(); const [loading, setLoading] = useState(false);
  async function confirm() { setLoading(true); const result = await simulateDevelopmentPaymentAction(paymentId); setLoading(false); if (!result.success) { toast({ title: "Confirmação não realizada", description: result.message, tone: "error" }); return; } toast({ title: "Pagamento local confirmado", description: "Nenhuma cobrança real foi feita.", tone: "success" }); router.push("/app/assinatura"); router.refresh(); }
  return <Button size="lg" onClick={confirm} loading={loading}><Check />Confirmar pagamento de teste</Button>;
}
