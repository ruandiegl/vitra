"use client";

import { useState } from "react";
import type { SiteSnapshot } from "@/lib/sites/types";
import { PublicSiteView } from "@/components/sites/public-site-view";
import { PhoneFrame } from "@/components/sites/phone-frame";
import { cn } from "@/lib/utils";

export type DemoTemplate = { name: string; slug: string; category: string; description: string; snapshot: SiteSnapshot };

export function DemoSwitcher({ templates, hero = false }: { templates: DemoTemplate[]; hero?: boolean }) {
  const [selected, setSelected] = useState(0);
  const current = templates[selected] ?? templates[0];
  if (!current) return null;
  if (hero) return <PhoneFrame><PublicSiteView snapshot={current.snapshot} preview /></PhoneFrame>;
  return <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-sm font-bold text-primary">Exemplos renderizados pelo próprio editor</p><h2 className="section-title mt-3">Um modelo para começar. A identidade é toda sua.</h2><p className="mt-5 max-w-lg text-lg text-muted">Alterne entre os modelos e veja como cada negócio pode organizar sua página.</p><div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Modelos de minisite">{templates.map((template, index) => <button key={template.slug} type="button" role="tab" aria-selected={index === selected} onClick={() => setSelected(index)} className={cn("min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition-colors", index === selected ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary")}>{template.category}</button>)}</div><div className="mt-7 border-l-2 border-primary pl-5"><h3 className="font-display text-2xl font-semibold">{current.name}</h3><p className="mt-1 text-muted">{current.description}</p></div></div><div className="relative rounded-[32px] bg-sky px-4 py-10 sm:px-12"><PhoneFrame><PublicSiteView key={current.slug} snapshot={current.snapshot} preview /></PhoneFrame></div></div>;
}
