import { prisma } from "@/lib/db";
import { PricingCards } from "@/components/marketing/pricing-cards";
export const dynamic = "force-dynamic";
export const metadata = { title: "Planos e preços" };
export default async function PricingPage() { const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { position: "asc" } }); return <section className="py-16 lg:py-24"><div className="shell"><div className="mx-auto mb-12 max-w-3xl text-center"><h1 className="display text-5xl sm:text-6xl">Escolha o espaço que seu negócio precisa.</h1><p className="mx-auto mt-5 max-w-2xl text-lg text-muted">Comece com 7 dias de teste sem cartão. Os preços e limites abaixo são os planos atualmente comercializados.</p></div><PricingCards plans={plans} /><p className="mt-8 text-center text-sm text-muted">O cancelamento pode ser solicitado no painel. Não há exclusão imediata dos seus dados.</p></div></section>; }
