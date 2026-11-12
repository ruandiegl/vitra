import { prisma } from "@/lib/db";
import { parseSiteSnapshot } from "@/lib/sites/snapshot";
import { TemplateSelector } from "@/components/sites/template-selector";
export const dynamic = "force-dynamic";
export const metadata = { title: "Escolha seu modelo" };
export default async function OnboardingPage() { const records = await prisma.template.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { position: "asc" }] }); const templates = records.flatMap((record) => { try { return [{ slug: record.slug, name: record.name, category: record.category, description: record.description, snapshot: parseSiteSnapshot(record.config) }]; } catch { return []; } }); return <div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-sm font-bold text-primary">Vamos começar</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em]">Qual é a cara do seu negócio?</h1><p className="mt-3 text-muted">Escolha um modelo para ganhar tempo. Depois, você poderá trocar cores, textos, imagens e blocos sem alterar o modelo original.</p></div><TemplateSelector templates={templates} /></div>; }
