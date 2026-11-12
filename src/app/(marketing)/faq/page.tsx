import { getLandingSection } from "@/lib/landing";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
export const dynamic = "force-dynamic";
export const metadata = { title: "Perguntas frequentes" };
export default async function FaqPage() { const faq = await getLandingSection("faq", { title: "Perguntas frequentes", items: [] }); return <section className="py-16 lg:py-24"><div className="shell grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><div><h1 className="display text-5xl">{faq.title}</h1><p className="mt-5 text-muted">Respostas sobre personalização, publicação e assinatura.</p></div><FaqAccordion items={faq.items} /></div></section>; }
