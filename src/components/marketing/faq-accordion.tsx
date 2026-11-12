"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

export type FaqItem = { question: string; answer: string };
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return <Accordion.Root type="single" collapsible className="divide-y divide-border border-y border-border">{items.map((item, index) => <Accordion.Item key={item.question} value={`item-${index}`}><Accordion.Header><Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-xl font-semibold hover:text-primary">{item.question}<Plus className="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45" aria-hidden="true" /></Accordion.Trigger></Accordion.Header><Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"><p className="max-w-3xl pb-6 leading-relaxed text-muted">{item.answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root>;
}
