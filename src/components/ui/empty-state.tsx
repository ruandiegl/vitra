import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="surface flex flex-col items-center px-6 py-14 text-center"><span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-sky text-primary"><Icon className="size-6" aria-hidden="true" /></span><h2 className="font-display text-2xl font-semibold">{title}</h2><p className="mt-2 max-w-md text-muted">{description}</p>{action ? <div className="mt-6">{action}</div> : null}</div>;
}
