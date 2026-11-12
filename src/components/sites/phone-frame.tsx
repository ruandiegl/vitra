import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative mx-auto w-full max-w-[340px] rounded-[42px] border-[7px] border-foreground bg-foreground p-1.5 shadow-[0_28px_70px_rgba(23,33,58,0.2)]", className)}><div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" aria-hidden="true" /><div className="relative h-[590px] overflow-y-auto rounded-[31px] bg-white [scrollbar-width:thin]">{children}</div></div>;
}
