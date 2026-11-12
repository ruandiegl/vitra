import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", inverse = false, className }: { href?: string; inverse?: boolean; className?: string }) {
  return <Link href={href} className={cn("inline-flex min-h-11 items-center gap-2.5 font-display text-[25px] font-bold tracking-[-0.04em]", inverse ? "text-white" : "text-foreground", className)} aria-label="Vitra — página inicial"><svg width="31" height="31" viewBox="0 0 31 31" fill="none" aria-hidden="true"><rect width="31" height="31" rx="9" fill={inverse ? "#FFFFFF" : "#3155D9"}/><path d="M8 9.5L12.1 22H15.5L19.6 9.5H23L17.4 25H13.6L8 9.5Z" fill={inverse ? "#3155D9" : "#FFFFFF"} transform="translate(0 -2)"/><path d="M19.5 8H23V12H19.5V8Z" fill="#D8F0E5"/></svg>Vitra</Link>;
}
