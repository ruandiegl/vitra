import { Check } from "lucide-react";
import Link from "next/link";
import type { Plan } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export function PricingCards({ plans }: { plans: Plan[] }) {
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{plans.map((plan, index) => { const features = Array.isArray(plan.features) ? plan.features.filter((item): item is string => typeof item === "string") : []; return <article key={plan.id} className={`flex flex-col rounded-[22px] border p-7 ${index === 0 ? "border-primary bg-white shadow-[0_16px_45px_rgba(49,85,217,0.1)]" : "border-border bg-white"}`}><div className="flex items-center justify-between"><h3 className="font-display text-2xl font-semibold">{plan.name}</h3>{index === 0 ? <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-primary">Para começar</span> : null}</div><p className="mt-3 min-h-12 text-sm text-muted">{plan.description}</p><p className="mt-6"><span className="font-display text-4xl font-semibold tracking-[-0.04em]">{formatMoney(plan.priceCents, plan.currency)}</span><span className="ml-1 text-sm text-muted">/{plan.interval === "MONTHLY" ? "mês" : "ano"}</span></p><ul className="my-7 flex-1 space-y-3 text-sm">{features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{feature}</li>)}</ul><Button asChild variant={index === 0 ? "default" : "secondary"} className="w-full"><Link href={`/cadastro?plano=${plan.slug}`}>Escolher {plan.name}</Link></Button></article>; })}</div>;
}
