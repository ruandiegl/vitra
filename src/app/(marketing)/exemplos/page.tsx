import { getDemoTemplates } from "@/lib/landing";
import { DemoSwitcher } from "@/components/marketing/demo-switcher";
export const dynamic = "force-dynamic";
export const metadata = { title: "Exemplos de minisites" };
export default async function ExamplesPage() { const templates = await getDemoTemplates(); return <section className="py-16 lg:py-24"><div className="shell"><div className="mb-14 max-w-3xl"><h1 className="display text-5xl sm:text-6xl">Modelos reais, prontos para a sua marca.</h1><p className="mt-5 text-lg text-muted">Estas demonstrações usam os mesmos blocos e temas do editor. Ao escolher um modelo, você recebe uma cópia independente para personalizar.</p></div><DemoSwitcher templates={templates} /></div></section>; }
