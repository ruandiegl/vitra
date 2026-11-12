import Link from "next/link";
import { ArrowRight, BarChart3, Check, Image, LayoutTemplate, Link2, MessageCircle, Palette, QrCode, Smartphone, Star, Upload } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDemoTemplates, getLandingSection } from "@/lib/landing";
import { Button } from "@/components/ui/button";
import { DemoSwitcher } from "@/components/marketing/demo-switcher";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const dynamic = "force-dynamic";
const featureIcons = [LayoutTemplate, Palette, Upload, Link2, MessageCircle, Star, BarChart3, QrCode];

export default async function HomePage() {
  const [plans, templates, hero, how, features, faq] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { position: "asc" } }),
    getDemoTemplates(),
    getLandingSection("hero", { headline: "Seu negócio merece mais do que um simples link na bio.", subtitle: "Crie um minisite profissional, personalize com a sua marca e reúna seus contatos, redes sociais e serviços em um só lugar.", primaryCta: "Criar meu minisite", secondaryCta: "Ver demonstração" }),
    getLandingSection("how_it_works", { title: "Do cadastro ao seu link publicado, sem complicação.", steps: [] }),
    getLandingSection("features", { title: "Uma vitrine completa. Um editor que não atrapalha.", items: [] }),
    getLandingSection("faq", { title: "Perguntas frequentes", items: [] }),
  ]);
  return <>
    <section className="overflow-hidden border-b border-border"><div className="shell grid items-center gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24"><div className="max-w-[670px]"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-muted"><Smartphone className="size-4 text-primary" aria-hidden="true" />Seu negócio inteiro em um só link</div><h1 className="display text-[clamp(2.75rem,5.5vw,4.75rem)]">{hero.headline}</h1><p className="mt-6 max-w-[590px] text-lg leading-relaxed text-muted">{hero.subtitle}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/cadastro">{hero.primaryCta}<ArrowRight aria-hidden="true" /></Link></Button><Button asChild size="lg" variant="secondary"><Link href="#demonstracao">{hero.secondaryCta}</Link></Button></div><ul className="mt-7 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">{["7 dias para experimentar", "Sem cartão para começar", "Prévia antes de publicar"].map((item) => <li key={item} className="flex items-center gap-1.5"><Check className="size-4 text-[#23795b]" aria-hidden="true" />{item}</li>)}</ul></div><div className="relative mx-auto w-full max-w-[500px] lg:mx-0"><div className="absolute -left-5 top-24 z-10 hidden items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-lg sm:flex"><span className="inline-flex size-10 items-center justify-center rounded-xl bg-mint text-[#23795b]"><Link2 className="size-5" /></span><div><p className="text-xs text-muted">Seu endereço exclusivo</p><p className="text-sm font-bold">vitra.site/s/seu-negocio</p></div></div><div className="absolute -right-2 bottom-20 z-10 hidden items-center gap-2 rounded-2xl border border-border bg-white p-3 text-sm font-bold shadow-lg sm:flex"><span className="inline-flex size-8 items-center justify-center rounded-lg bg-sky text-primary"><Palette className="size-4" /></span>Do seu jeito</div><div className="rounded-[44px] bg-sky px-5 py-8 sm:px-12"><DemoSwitcher templates={templates.slice(0, 1)} hero /></div></div></div></section>

    <section id="como-funciona" className="py-20 lg:py-28"><div className="shell"><div className="max-w-2xl"><p className="font-bold text-primary">Como funciona</p><h2 className="section-title mt-3">{how.title}</h2></div><div className="mt-12 grid gap-px overflow-hidden rounded-[22px] border border-border bg-border md:grid-cols-3">{how.steps.map((step, index) => <article key={step.title} className="bg-white p-7 lg:p-9"><span className="font-display text-sm font-bold text-primary">Etapa {index + 1}</span><h3 className="mt-7 font-display text-2xl font-semibold">{step.title}</h3><p className="mt-3 text-muted">{step.text}</p></article>)}</div></div></section>

    <section id="demonstracao" className="bg-white py-20 lg:py-28"><div className="shell"><DemoSwitcher templates={templates} /></div></section>

    <section id="funcionalidades" className="py-20 lg:py-28"><div className="shell"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-bold text-primary">Funcionalidades</p><h2 className="section-title mt-3">{features.title}</h2><p className="mt-5 max-w-md text-lg text-muted">Da primeira configuração à próxima alteração, tudo foi pensado para você não depender de código.</p></div><div className="grid gap-3 sm:grid-cols-2">{features.items.map((item, index) => { const Icon = featureIcons[index % featureIcons.length] ?? Image; return <div key={item} className="flex min-h-24 items-center gap-4 border-b border-border px-2 py-5"><span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky text-primary"><Icon className="size-5" aria-hidden="true" /></span><h3 className="font-semibold">{item}</h3></div>; })}</div></div></div></section>

    <section id="planos" className="bg-white py-20 lg:py-28"><div className="shell"><div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="font-bold text-primary">Planos</p><h2 className="section-title mt-3">Um investimento claro para manter sua vitrine no ar.</h2></div><p className="max-w-md text-muted">Teste por 7 dias sem cartão. Escolha o plano quando estiver pronto para continuar publicando.</p></div><PricingCards plans={plans} /></div></section>

    <section id="faq" className="py-20 lg:py-28"><div className="shell grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><div><p className="font-bold text-primary">Antes de começar</p><h2 className="section-title mt-3">{faq.title}</h2><p className="mt-4 text-muted">Informações diretas para você escolher com segurança.</p></div><FaqAccordion items={faq.items} /></div></section>

    <section className="pb-20"><div className="shell overflow-hidden rounded-[28px] bg-foreground px-6 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between"><div><h2 className="font-display text-4xl font-semibold tracking-[-0.035em]">Seu próximo cliente pode encontrar tudo em um só lugar.</h2><p className="mt-4 max-w-xl text-[#c2cbe0]">Crie sua conta, personalize sua página e veja o resultado antes de publicar.</p></div><Button asChild size="lg" variant="mint" className="mt-8 shrink-0 lg:mt-0"><Link href="/cadastro">Começar meu teste grátis<ArrowRight /></Link></Button></div></section>
  </>;
}
