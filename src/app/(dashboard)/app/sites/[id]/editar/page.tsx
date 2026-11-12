import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getAccessState } from "@/lib/billing/access";
import { snapshotFromVersion } from "@/lib/sites/snapshot";
import { SiteEditor } from "@/components/sites/site-editor";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar minisite" };
export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { membership, user } = await requireWorkspace(`/app/sites/${id}/editar`); const site = await prisma.site.findFirst({ where: { id, workspaceId: membership.workspaceId }, include: { draftVersion: { include: { blocks: { orderBy: { position: "asc" } }, theme: true } }, publishedVersion: { include: { blocks: { orderBy: { position: "asc" } }, theme: true } } } }); if (!site?.draftVersion?.theme) notFound(); const subscription = await prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId }, include: { plan: true } }); const access = getAccessState(subscription); const snapshot = snapshotFromVersion(site.draftVersion); return <SiteEditor siteId={site.id} initialSlug={site.slug} initialSnapshot={snapshot} initialStatus={site.status} canPublish={Boolean(user.emailVerified && access.canPublish)} publicUrl={absoluteUrl(`/s/${site.slug}`)} />; }
