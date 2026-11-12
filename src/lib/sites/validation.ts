import { z } from "zod";
import type { BlockType } from "@prisma/client";

export const reservedSlugs = new Set([
  "admin", "api", "app", "s", "login", "cadastro", "recuperar-senha",
  "precos", "exemplos", "faq", "termos", "privacidade", "suporte", "vitra",
]);

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Use pelo menos 3 caracteres.")
  .max(48, "Use no máximo 48 caracteres.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens.")
  .refine((slug) => !reservedSlugs.has(slug), "Este endereço é reservado pela plataforma.");

export function safeExternalUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(safeExternalUrl, "Informe uma URL http(s) válida, sem credenciais.");

const requiredUrl = optionalUrl.refine((value) => value.length > 0, "Informe o link de destino.");
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use uma cor hexadecimal de 6 dígitos.");
const shortText = (max: number) => z.string().trim().max(max);

export const siteConfigSchema = z.object({
  businessName: shortText(80).min(2, "Informe o nome do negócio."),
  title: shortText(100).min(2, "Informe o título da página."),
  description: shortText(280),
  category: shortText(60),
  logoUrl: z.string().trim().max(2048).refine((value) => !value || value.startsWith("/uploads/") || safeExternalUrl(value), "Imagem inválida."),
  seoTitle: shortText(70),
  seoDescription: shortText(170),
  socialImageUrl: z.string().trim().max(2048).refine((value) => !value || value.startsWith("/uploads/") || safeExternalUrl(value), "Imagem inválida."),
});

export const siteThemeSchema = z.object({
  primaryColor: hexColor,
  secondaryColor: hexColor,
  textColor: hexColor,
  buttonColor: hexColor,
  buttonTextColor: hexColor,
  backgroundColor: hexColor,
  backgroundImage: z.string().trim().max(2048).refine((value) => !value || value.startsWith("/uploads/") || safeExternalUrl(value), "Imagem inválida."),
  font: z.enum(["DM Sans", "Bricolage Grotesque", "Georgia", "Arial"]),
  cornerRadius: z.number().int().min(0).max(32),
  spacing: z.number().int().min(8).max(32),
  buttonStyle: z.enum(["solid", "outline", "soft"]),
  logoShape: z.enum(["circle", "square"]),
  showPlatformMark: z.boolean(),
});

const socialLinkSchema = z.object({
  id: z.string().min(1).max(80),
  platform: z.enum(["instagram", "tiktok", "whatsapp", "facebook", "youtube", "linkedin", "website"]),
  url: requiredUrl,
});

const baseBlock = {
  id: z.string().optional(),
  key: z.string().min(8).max(80),
  position: z.number().int().min(0).max(500),
  isVisible: z.boolean(),
};

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ ...baseBlock, type: z.literal("HEADER"), content: z.object({
    showName: z.boolean(), showDescription: z.boolean(), alignment: z.enum(["left", "center"]),
  }) }),
  z.object({ ...baseBlock, type: z.literal("BUTTON"), content: z.object({
    label: shortText(60).min(1, "Informe o texto do botão."), url: requiredUrl,
    icon: shortText(30), newTab: z.boolean(),
  }) }),
  z.object({ ...baseBlock, type: z.literal("SOCIAL_LINKS"), content: z.object({
    links: z.array(socialLinkSchema).max(12),
  }) }),
  z.object({ ...baseBlock, type: z.literal("BANNER"), content: z.object({
    imageUrl: z.string().max(2048).refine((value) => value.startsWith("/uploads/") || safeExternalUrl(value), "Imagem inválida."),
    alt: shortText(140), title: shortText(100), description: shortText(240), url: optionalUrl,
  }) }),
  z.object({ ...baseBlock, type: z.literal("TEXT"), content: z.object({
    title: shortText(100), body: shortText(2000),
  }) }),
  z.object({ ...baseBlock, type: z.literal("DIVIDER"), content: z.object({}).strict() }),
  z.object({ ...baseBlock, type: z.literal("GOOGLE_REVIEW"), content: z.object({
    label: shortText(60).min(1), url: requiredUrl,
  }) }),
  z.object({ ...baseBlock, type: z.literal("CONTACT"), content: z.object({
    phone: shortText(30), email: z.union([z.literal(""), z.string().trim().email().max(160)]),
    address: shortText(240), mapsUrl: optionalUrl, whatsappNumber: shortText(24),
    whatsappMessage: shortText(300), whatsappLabel: shortText(60),
  }) }),
]);

export const siteSnapshotSchema = z.object({
  config: siteConfigSchema,
  theme: siteThemeSchema,
  blocks: z.array(blockSchema).max(100),
});

export function normalizeWhatsAppNumber(value: string) {
  let digits = value.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (!/^\d{12,15}$/.test(digits)) {
    throw new Error("Informe um número válido com DDD. Exemplo: (11) 99999-9999.");
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message = "") {
  const number = normalizeWhatsAppNumber(phone);
  const query = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${number}${query}`;
}

export const blockLabels: Record<BlockType, string> = {
  HEADER: "Cabeçalho",
  BUTTON: "Botão",
  SOCIAL_LINKS: "Redes sociais",
  BANNER: "Banner",
  TEXT: "Texto",
  DIVIDER: "Separador",
  GOOGLE_REVIEW: "Avaliações do Google",
  CONTACT: "Contato",
};
