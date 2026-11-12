import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getLandingSection } from "@/lib/landing";

export const dynamic = "force-dynamic";
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const footer = await getLandingSection("footer", { supportEmail: "suporte@example.com", whatsapp: "", instagram: "", description: "Minisites profissionais para pequenos negócios." });
  return <><SiteHeader /><main id="conteudo">{children}</main><SiteFooter supportEmail={footer.supportEmail} description={footer.description} /></>;
}
