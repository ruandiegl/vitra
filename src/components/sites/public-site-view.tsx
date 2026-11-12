"use client";

import { useEffect, type CSSProperties } from "react";
import { ArrowUpRight, Facebook, Globe, Instagram, Linkedin, Mail, MapPin, MessageCircle, Music2, Phone, Play, Star, Youtube, Link as LinkIcon } from "lucide-react";
import type { SiteBlockData, SiteSnapshot, SocialPlatform } from "@/lib/sites/types";
import { buildWhatsAppUrl } from "@/lib/sites/validation";
import { getInitials } from "@/lib/utils";

const socialIcons: Record<SocialPlatform, typeof Globe> = { instagram: Instagram, tiktok: Music2, whatsapp: MessageCircle, facebook: Facebook, youtube: Youtube, linkedin: Linkedin, website: Globe };

function sendClick(slug: string | undefined, blockKey: string) {
  if (!slug) return;
  const body = JSON.stringify({ slug, blockKey });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics/click", new Blob([body], { type: "application/json" }));
  else void fetch("/api/analytics/click", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}

export function PublicSiteView({ snapshot, slug, preview = false }: { snapshot: SiteSnapshot; slug?: string; preview?: boolean }) {
  const { config, theme } = snapshot;
  useEffect(() => {
    if (preview || !slug) return;
    void fetch("/api/analytics/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => undefined);
  }, [preview, slug]);

  const style = {
    "--site-primary": theme.primaryColor,
    "--site-secondary": theme.secondaryColor,
    "--site-text": theme.textColor,
    "--site-button": theme.buttonColor,
    "--site-button-text": theme.buttonTextColor,
    "--site-radius": `${theme.cornerRadius}px`,
    "--site-spacing": `${theme.spacing}px`,
    backgroundColor: theme.backgroundColor,
    backgroundImage: theme.backgroundImage ? `url("${theme.backgroundImage.replace(/["\\\n\r]/g, "")}")` : undefined,
    fontFamily: theme.font === "Bricolage Grotesque" ? "var(--font-bricolage), Georgia, serif" : theme.font === "DM Sans" ? "var(--font-dm-sans), Arial, sans-serif" : theme.font,
    color: theme.textColor,
  } as CSSProperties;

  function linkProps(block: SiteBlockData, url: string, newTab = true) {
    return { href: url, target: newTab ? "_blank" : undefined, rel: newTab ? "noopener noreferrer" : undefined, onClick: () => { if (!preview) sendClick(slug, block.key); } };
  }

  function renderBlock(block: SiteBlockData) {
    const content = block.content as never;
    switch (block.type) {
      case "HEADER": {
        const data = content as SiteBlockData<"HEADER">["content"];
        return <header key={block.key} className={data.alignment === "center" ? "text-center" : "text-left"}>
          {config.logoUrl ? <img src={config.logoUrl} alt={`Logo de ${config.businessName}`} className={`mb-5 size-24 object-cover ${data.alignment === "center" ? "mx-auto" : ""} ${theme.logoShape === "circle" ? "rounded-full" : "rounded-[var(--site-radius)]"}`} /> : <div className={`mb-5 flex size-24 items-center justify-center bg-[var(--site-secondary)] font-display text-3xl font-semibold text-[var(--site-primary)] ${data.alignment === "center" ? "mx-auto" : ""} ${theme.logoShape === "circle" ? "rounded-full" : "rounded-[var(--site-radius)]"}`} aria-hidden="true">{getInitials(config.businessName)}</div>}
          {data.showName ? <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.03em]">{config.businessName}</h1> : null}
          {data.showDescription && config.description ? <p className="mx-auto mt-3 max-w-[36ch] whitespace-pre-line text-[15px] leading-relaxed opacity-80">{config.description}</p> : null}
        </header>;
      }
      case "BUTTON": {
        const data = content as SiteBlockData<"BUTTON">["content"];
        const Icon = data.icon === "message" ? MessageCircle : data.icon === "play" ? Play : LinkIcon;
        const buttonStyle = theme.buttonStyle === "solid" ? { backgroundColor: theme.buttonColor, color: theme.buttonTextColor, border: `1px solid ${theme.buttonColor}` } : theme.buttonStyle === "outline" ? { backgroundColor: "transparent", color: theme.buttonColor, border: `2px solid ${theme.buttonColor}` } : { backgroundColor: theme.secondaryColor, color: theme.buttonColor, border: `1px solid ${theme.secondaryColor}` };
        return <a key={block.key} {...linkProps(block, data.url, data.newTab)} className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[var(--site-radius)] px-5 py-3 text-center font-bold transition-transform duration-200 hover:-translate-y-0.5" style={buttonStyle}><Icon className="size-5 shrink-0" aria-hidden="true" /><span>{data.label}</span><ArrowUpRight className="ml-auto size-4 opacity-70" aria-hidden="true" /></a>;
      }
      case "SOCIAL_LINKS": {
        const data = content as SiteBlockData<"SOCIAL_LINKS">["content"];
        if (!data.links.length) return null;
        return <nav key={block.key} aria-label="Redes sociais" className="flex flex-wrap items-center justify-center gap-3 py-1">{data.links.map((link) => { const Icon = socialIcons[link.platform]; return <a key={link.id} {...linkProps(block, link.url)} aria-label={link.platform === "website" ? "Website" : link.platform} className="inline-flex size-12 items-center justify-center rounded-full border border-current/15 bg-white/10 transition-colors hover:bg-[var(--site-secondary)]"><Icon className="size-5" aria-hidden="true" /></a>; })}</nav>;
      }
      case "BANNER": {
        const data = content as SiteBlockData<"BANNER">["content"];
        const body = <>{data.imageUrl ? <img src={data.imageUrl} alt={data.alt || data.title} className="aspect-[16/9] w-full object-cover" /> : null}<div className={data.imageUrl ? "p-4" : "bg-[var(--site-secondary)] p-6"}>{data.title ? <h2 className="font-display text-xl font-semibold">{data.title}</h2> : null}{data.description ? <p className="mt-1 text-sm opacity-75">{data.description}</p> : null}</div></>;
        return data.url ? <a key={block.key} {...linkProps(block, data.url)} className="block overflow-hidden rounded-[var(--site-radius)] bg-white/25">{body}</a> : <div key={block.key} className="overflow-hidden rounded-[var(--site-radius)] bg-white/25">{body}</div>;
      }
      case "TEXT": {
        const data = content as SiteBlockData<"TEXT">["content"];
        return <section key={block.key} className="px-1 py-2">{data.title ? <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">{data.title}</h2> : null}{data.body ? <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed opacity-80">{data.body}</p> : null}</section>;
      }
      case "DIVIDER": return <hr key={block.key} className="border-0 border-t border-current/15" />;
      case "GOOGLE_REVIEW": {
        const data = content as SiteBlockData<"GOOGLE_REVIEW">["content"];
        return <a key={block.key} {...linkProps(block, data.url)} className="flex min-h-13 items-center justify-center gap-2 rounded-[var(--site-radius)] border border-current/15 px-4 py-3 text-sm font-bold hover:bg-[var(--site-secondary)]"><Star className="size-5" aria-hidden="true" />{data.label}<ArrowUpRight className="size-4" aria-hidden="true" /></a>;
      }
      case "CONTACT": {
        const data = content as SiteBlockData<"CONTACT">["content"];
        let whatsapp = ""; if (data.whatsappNumber) { try { whatsapp = buildWhatsAppUrl(data.whatsappNumber, data.whatsappMessage); } catch { whatsapp = ""; } }
        return <section key={block.key} className="space-y-2 rounded-[var(--site-radius)] bg-[var(--site-secondary)] p-4"><h2 className="mb-3 font-display text-xl font-semibold">Contato</h2>{whatsapp ? <a {...linkProps(block, whatsapp)} className="flex min-h-11 items-center gap-3 font-semibold"><MessageCircle className="size-5" />{data.whatsappLabel || "WhatsApp"}</a> : null}{data.phone ? <a {...linkProps(block, `tel:${data.phone.replace(/[^\d+]/g, "")}`, false)} className="flex min-h-11 items-center gap-3"><Phone className="size-5" />{data.phone}</a> : null}{data.email ? <a {...linkProps(block, `mailto:${data.email}`, false)} className="flex min-h-11 items-center gap-3 break-all"><Mail className="size-5 shrink-0" />{data.email}</a> : null}{data.address ? <p className="flex items-start gap-3 py-2"><MapPin className="mt-0.5 size-5 shrink-0" />{data.address}</p> : null}{data.mapsUrl ? <a {...linkProps(block, data.mapsUrl)} className="flex min-h-11 items-center gap-3 font-semibold"><MapPin className="size-5" />Como chegar</a> : null}</section>;
      }
      default: return null;
    }
  }

  return <div className="min-h-full bg-cover bg-fixed bg-center" style={style}><div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col gap-[var(--site-spacing)] px-5 py-9 sm:px-7">{snapshot.blocks.filter((block) => block.isVisible).sort((a, b) => a.position - b.position).map(renderBlock)}{theme.showPlatformMark ? <a href="/" target="_blank" rel="noopener noreferrer" className="mx-auto mt-5 inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold opacity-60 hover:opacity-100">Criado com Vitra</a> : null}</div></div>;
}
