import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAccessState } from "@/lib/billing/access";
import { snapshotFromVersion } from "@/lib/sites/snapshot";
import { PublicSiteView } from "@/components/sites/public-site-view";

export const dynamic = "force-dynamic";
async function getPublicSite(slug: string) { return prisma.site.findFirst({ where: { slug, status: "PUBLISHED" }, include: { publishedVersion: { include: { blocks: { orderBy: { position: "asc" } }, theme: true } }, workspace: { include: { subscription: true } } } }); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const site = await getPublicSite(slug); if (!site?.publishedVersion) return { title: "Minisite indisponível" }; const config = site.publishedVersion.config as { businessName?: string; seoTitle?: string; seoDescription?: string; description?: string; socialImageUrl?: string }; return { title: config.seoTitle || config.businessName || "Minisite", description: config.seoDescription || config.description || undefined, openGraph: { title: config.seoTitle || config.businessName, description: config.seoDescription || config.description, images: config.socialImageUrl ? [config.socialImageUrl] : undefined }, robots: { index: true, follow: true } }; }
export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const site = await getPublicSite(slug); if (!site?.publishedVersion?.theme || !getAccessState(site.workspace.subscription).canReceiveVisitors) notFound(); return <div className="min-h-screen"><PublicSiteView snapshot={snapshotFromVersion(site.publishedVersion)} slug={site.slug} /></div>; }
