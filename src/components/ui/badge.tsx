import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const styles = {
  neutral: "bg-[#edf0f5] text-[#485168]",
  success: "bg-mint text-[#185b43]",
  info: "bg-sky text-[#2443a8]",
  warning: "bg-[#fff1cc] text-[#735000]",
  danger: "bg-[#fee4e2] text-[#912018]",
};

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof styles }) {
  return <span className={cn("inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-xs font-bold", styles[tone], className)} {...props} />;
}
