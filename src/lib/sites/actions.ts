"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth/session";
import { getAccessState } from "@/lib/billing/access";
import { absoluteUrl } from "@/lib/utils";
import { siteConfigSchema, siteSnapshotSchema, siteThemeSchema, slugSchema, slugify } from "./validation";
import { parseSiteSnapshot } from "./snapshot";
import type { SiteConfig, SiteSnapshot, SiteThemeData } from "./types";

export type SiteActionResult = { success: boolean; message: string; siteId?: string; slug?: string; qrCode?: string };

async function billingFor(workspaceId: string) {
  return prisma.subscription.findUnique({ where: { workspaceId }, include: { plan: true } });
}

async function uniqueSlug(base: string, excludeSiteId?: string) {
  const normalized = slugSchema.parse(slugify(base));
  const existing = await prisma.site.findFirst({ where: { slug: normalized, ...(excludeSiteId ? { id: { not: excludeSiteId } } : {}) }, select: { id: true } });
  if (existing) throw new Error("Este endereço já está em uso. Escolha outro.");
  return normalized;
}

function themeData(snapshot: SiteSnapshot) {
  return { ...snapshot.theme, backgroundImage: snapshot.theme.backgroundImage || null };
}

export async function createSiteAction(input: unknown): Promise<SiteActionResult> {
  try {
    const { membership } = await requireWorkspace("/app/onboarding");
    const workspaceId = membership.workspaceId;
    const [subscription, count] = await Promise.all([billingFor(workspaceId), prisma.site.count({ where: { workspaceId } })]);
    if (!subscription || !getAccessState(subscription).canEdit) return { success: false, message: "Regularize sua assinatura para criar um minisite." };
    if (count >= subscription.plan.minisiteLimit) return { success: false, message: `Seu plano permite ${subscription.plan.minisiteLimit} minisite(s). Altere o plano para criar mais.` };
    const values = input as { name?: unknown; slug?: unknown; templateSlug?: unknown };
    const name = typeof values.name === "string" ? values.name.trim().slice(0, 80) : "";
    if (name.length < 2) return { success: false, message: "Informe um nome com pelo menos 2 caracteres." };
    const slug = await uniqueSlug(typeof values.slug === "string" && values.slug ? values.slug : name);
    const template = await prisma.template.findFirst({ where: { slug: String(values.templateSlug ?? "pagina-em-branco"), status: "PUBLISHED" } });
    if (!template) return { success: false, message: "O modelo escolhido não está disponível." };
    const snapshot = parseSiteSnapshot(template.config);
    snapshot.config.businessName = name;
    snapshot.config.title = name;
    if (snapshot.blocks.length > subscription.plan.blockLimit) return { success: false, message: "Este modelo excede o limite de blocos do seu plano." };
    const site = await prisma.$transaction(async (tx) => {
      const created = await tx.site.create({ data: { workspaceId, name, slug } });
      const version = await tx.siteVersion.create({ data: {
        siteId: created.id, number: 1, kind: "DRAFT", config: snapshot.config as unknown as Prisma.InputJsonValue,
        theme: { create: themeData(snapshot) },
        blocks: { create: snapshot.blocks.map((block) => ({ key: block.key, type: block.type, position: block.position, isVisible: block.isVisible, content: block.content as Prisma.InputJsonValue })) },
      } });
      return tx.site.update({ where: { id: created.id }, data: { draftVersionId: version.id } });
    });
    revalidatePath("/app/sites");
    return { success: true, message: "Minisite criado. Agora deixe com a cara do seu negócio.", siteId: site.id };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Não foi possível criar o minisite." };
  }
}

export async function saveDraftAction(siteId: string, input: unknown): Promise<SiteActionResult> {
  try {
    const { membership } = await requireWorkspace(`/app/sites/${siteId}/editar`);
    const site = await prisma.site.findFirst({ where: { id: siteId, workspaceId: membership.workspaceId }, include: { draftVersion: true } });
    if (!site?.draftVersion) return { success: false, message: "Minisite não encontrado." };
    const subscription = await billingFor(membership.workspaceId);
    if (!subscription || !getAccessState(subscription).canEdit) return { success: false, message: "Seu acesso de edição está expirado." };
    const parsed = siteSnapshotSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Revise os campos do minisite." };
    if (parsed.data.blocks.length > subscription.plan.blockLimit) return { success: false, message: `Seu plano permite até ${subscription.plan.blockLimit} blocos por minisite.` };
    if (!subscription.plan.removableBranding) parsed.data.theme.showPlatformMark = true;
    const snapshot = parsed.data as unknown as SiteSnapshot;
    await prisma.$transaction(async (tx) => {
      await tx.siteBlock.deleteMany({ where: { versionId: site.draftVersionId! } });
      await tx.siteBlock.createMany({ data: snapshot.blocks.map((block) => ({ versionId: site.draftVersionId!, key: block.key, type: block.type, position: block.position, isVisible: block.isVisible, content: block.content as Prisma.InputJsonValue })) });
      await tx.siteVersion.update({ where: { id: site.draftVersionId! }, data: { config: snapshot.config as unknown as Prisma.InputJsonValue } });
      await tx.siteTheme.update({ where: { versionId: site.draftVersionId! }, data: themeData(snapshot) });
      await tx.site.update({ where: { id: site.id }, data: { name: snapshot.config.businessName } });
    });
    revalidatePath(`/app/sites/${siteId}/editar`);
    return { success: true, message: "Rascunho salvo." };
  } catch (error) {
    console.error("saveDraftAction", error);
    return { success: false, message: "Não foi possível salvar. Revise os campos e tente novamente." };
  }
}

export async function changeSlugAction(siteId: string, value: string): Promise<SiteActionResult> {
  try {
    const { membership } = await requireWorkspace();
    const site = await prisma.site.findFirst({ where: { id: siteId, workspaceId: membership.workspaceId } });
    if (!site) return { success: false, message: "Minisite não encontrado." };
    const slug = await uniqueSlug(value, siteId);
    await prisma.site.update({ where: { id: siteId }, data: { slug } });
    revalidatePath(`/app/sites/${siteId}/editar`);
    return { success: true, message: "Endereço atualizado.", slug };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Slug inválido." }; }
}

export async function publishSiteAction(siteId: string): Promise<SiteActionResult> {
  try {
    const { membership, user } = await requireWorkspace(`/app/sites/${siteId}/editar`);
    if (!user.emailVerified) return { success: false, message: "Confirme seu e-mail antes de publicar. Use o botão no topo do painel." };
    const site = await prisma.site.findFirst({ where: { id: siteId, workspaceId: membership.workspaceId }, include: { draftVersion: { include: { blocks: true, theme: true } } } });
    if (!site?.draftVersion?.theme) return { success: false, message: "Minisite não encontrado." };
    const subscription = await billingFor(membership.workspaceId);
    if (!subscription || !getAccessState(subscription).canPublish) return { success: false, message: "Sua assinatura não permite publicar agora. Consulte a área de assinatura." };
    const config = siteConfigSchema.parse(site.draftVersion.config);
    const theme = siteThemeSchema.parse({ ...site.draftVersion.theme, backgroundImage: site.draftVersion.theme.backgroundImage ?? "" }) as SiteThemeData;
    const snapshot = siteSnapshotSchema.parse({ config, theme, blocks: site.draftVersion.blocks }) as unknown as SiteSnapshot;
    const published = await prisma.$transaction(async (tx) => {
      if (site.publishedVersionId) await tx.siteVersion.update({ where: { id: site.publishedVersionId }, data: { kind: "ARCHIVED" } });
      const last = await tx.siteVersion.aggregate({ where: { siteId: site.id }, _max: { number: true } });
      const version = await tx.siteVersion.create({ data: {
        siteId: site.id, number: (last._max.number ?? 0) + 1, kind: "PUBLISHED", publishedAt: new Date(),
        config: snapshot.config as unknown as Prisma.InputJsonValue,
        theme: { create: themeData(snapshot) },
        blocks: { create: snapshot.blocks.map((block) => ({ key: block.key, type: block.type, position: block.position, isVisible: block.isVisible, content: block.content as Prisma.InputJsonValue })) },
      } });
      return tx.site.update({ where: { id: site.id }, data: { publishedVersionId: version.id, status: "PUBLISHED", publishedAt: new Date() } });
    });
    revalidatePath(`/s/${site.slug}`); revalidatePath("/app"); revalidatePath("/app/sites");
    return { success: true, message: "Minisite publicado. O link já está no ar.", slug: published.slug };
  } catch (error) {
    console.error("publishSiteAction", error);
    return { success: false, message: "Não foi possível publicar. Salve o rascunho e revise os campos obrigatórios." };
  }
}

export async function unpublishSiteAction(siteId: string): Promise<SiteActionResult> {
  const { membership } = await requireWorkspace();
  const result = await prisma.site.updateMany({ where: { id: siteId, workspaceId: membership.workspaceId, status: "PUBLISHED" }, data: { status: "UNPUBLISHED" } });
  if (!result.count) return { success: false, message: "O minisite não está publicado ou não foi encontrado." };
  revalidatePath("/app/sites"); revalidatePath("/app");
  return { success: true, message: "Minisite despublicado. O rascunho e o histórico foram preservados." };
}

export async function deleteSiteAction(siteId: string): Promise<SiteActionResult> {
  const { membership } = await requireWorkspace();
  const site = await prisma.site.findFirst({ where: { id: siteId, workspaceId: membership.workspaceId }, select: { id: true, slug: true } });
  if (!site) return { success: false, message: "Minisite não encontrado." };
  await prisma.site.delete({ where: { id: site.id } });
  revalidatePath("/app/sites"); revalidatePath("/app");
  return { success: true, message: "Minisite excluído." };
}

export async function duplicateSiteAction(siteId: string): Promise<SiteActionResult> {
  try {
    const { membership } = await requireWorkspace();
    const workspaceId = membership.workspaceId;
    const [source, subscription, count] = await Promise.all([
      prisma.site.findFirst({ where: { id: siteId, workspaceId }, include: { draftVersion: { include: { blocks: true, theme: true } } } }),
      billingFor(workspaceId), prisma.site.count({ where: { workspaceId } }),
    ]);
    if (!source?.draftVersion?.theme) return { success: false, message: "Minisite não encontrado." };
    if (!subscription || count >= subscription.plan.minisiteLimit) return { success: false, message: "O limite de minisites do seu plano foi atingido." };
    const baseSlug = slugify(`${source.slug}-copia`).slice(0, 42);
    let slug = baseSlug; let suffix = 2;
    while (await prisma.site.findUnique({ where: { slug } })) slug = `${baseSlug}-${suffix++}`;
    const config = siteConfigSchema.parse(source.draftVersion.config);
    config.businessName = `${config.businessName} (cópia)`.slice(0, 80);
    config.title = `${config.title} (cópia)`.slice(0, 100);
    const theme = { ...siteThemeSchema.parse({ ...source.draftVersion.theme, backgroundImage: source.draftVersion.theme.backgroundImage ?? "" }) } as SiteThemeData;
    const copy = await prisma.$transaction(async (tx) => {
      const site = await tx.site.create({ data: { workspaceId, name: config.businessName, slug } });
      const version = await tx.siteVersion.create({ data: { siteId: site.id, number: 1, config: config as unknown as Prisma.InputJsonValue, theme: { create: { ...theme, backgroundImage: theme.backgroundImage || null } }, blocks: { create: source.draftVersion!.blocks.map((block) => ({ key: `${block.key}-${randomBytes(3).toString("hex")}`, type: block.type, position: block.position, isVisible: block.isVisible, content: block.content as Prisma.InputJsonValue })) } } });
      return tx.site.update({ where: { id: site.id }, data: { draftVersionId: version.id } });
    });
    revalidatePath("/app/sites");
    return { success: true, message: "Cópia criada como rascunho.", siteId: copy.id };
  } catch { return { success: false, message: "Não foi possível duplicar o minisite." }; }
}

export async function getSiteQrCodeAction(siteId: string): Promise<SiteActionResult> {
  const { membership } = await requireWorkspace();
  const site = await prisma.site.findFirst({ where: { id: siteId, workspaceId: membership.workspaceId }, select: { slug: true } });
  if (!site) return { success: false, message: "Minisite não encontrado." };
  const qrCode = await QRCode.toDataURL(absoluteUrl(`/s/${site.slug}`), { width: 512, margin: 2, color: { dark: "#17213A", light: "#FFFFFF" } });
  return { success: true, message: "QR Code gerado.", qrCode, slug: site.slug };
}

