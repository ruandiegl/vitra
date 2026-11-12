import { prisma } from "@/lib/db";
import { parseSiteSnapshot } from "@/lib/sites/snapshot";
import { starterTemplates } from "@/lib/sites/templates";
import type { DemoTemplate } from "@/components/marketing/demo-switcher";

export type LandingContentMap = {
  hero: { headline: string; subtitle: string; primaryCta: string; secondaryCta: string };
  how_it_works: { title: string; steps: { title: string; text: string }[] };
  features: { title: string; items: string[] };
  faq: { title: string; items: { question: string; answer: string }[] };
  footer: { supportEmail: string; whatsapp: string; instagram: string; description: string };
  seo: { title: string; description: string };
};

export async function getLandingSection<K extends keyof LandingContentMap>(section: K, fallback: LandingContentMap[K]): Promise<LandingContentMap[K]> {
  const record = await prisma.landingContent.findUnique({ where: { section } });
  if (!record?.isVisible || !record.content || typeof record.content !== "object" || Array.isArray(record.content)) return fallback;
  return { ...fallback, ...(record.content as object) } as LandingContentMap[K];
}

export async function getDemoTemplates(): Promise<DemoTemplate[]> {
  const records = await prisma.template.findMany({ where: { status: "PUBLISHED", featured: true, slug: { not: "pagina-em-branco" } }, orderBy: { position: "asc" }, take: 5 });
  const templates = records.flatMap((record) => {
    try { return [{ name: record.name, slug: record.slug, category: record.category, description: record.description, snapshot: parseSiteSnapshot(record.config) }]; }
    catch { return []; }
  });
  if (templates.length) return templates;
  return starterTemplates.filter((template) => template.slug !== "pagina-em-branco").slice(0, 5).map((template) => ({ name: template.name, slug: template.slug, category: template.category, description: template.description, snapshot: parseSiteSnapshot({ config: template.config, theme: template.theme, blocks: template.blocks }) }));
}
