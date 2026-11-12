import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAccessState } from "@/lib/billing/access";
import { checkRateLimit, getRequestFingerprint, RateLimitError } from "@/lib/security/rate-limit";

const eventSchema = z.object({ slug: z.string().min(3).max(48), blockKey: z.string().min(8).max(80).optional() });
async function parse(request: Request) { return eventSchema.safeParse(await request.json().catch(() => null)); }
export async function recordAnalyticsEvent(request: Request, type: "PAGE_VIEW" | "LINK_CLICK") {
  try {
    const parsed = await parse(request); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
    const { slug, blockKey } = parsed.data; const site = await prisma.site.findFirst({ where: { slug, status: "PUBLISHED" }, include: { workspace: { include: { subscription: true } }, publishedVersion: { include: { blocks: { select: { key: true } } } } } });
    if (!site || !getAccessState(site.workspace.subscription).canReceiveVisitors) return NextResponse.json({ ok: false }, { status: 404 });
    if (type === "LINK_CLICK" && (!blockKey || !site.publishedVersion?.blocks.some((block) => block.key === blockKey))) return NextResponse.json({ ok: false }, { status: 400 });
    const requestHeaders = await headers(); const fingerprint = await getRequestFingerprint(); const userAgent = requestHeaders.get("user-agent") ?? "unknown";
    checkRateLimit(`analytics:${fingerprint}:${site.id}`, type === "PAGE_VIEW" ? 30 : 120, 60 * 1000);
    const visitorHash = createHash("sha256").update(`${process.env.ANALYTICS_SALT ?? "development"}:${fingerprint}:${userAgent}:${new Date().toISOString().slice(0, 10)}`).digest("hex").slice(0, 32);
    if (type === "PAGE_VIEW") { const recent = await prisma.analyticsEvent.findFirst({ where: { siteId: site.id, type, visitorHash, occurredAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } }, select: { id: true } }); if (recent) return NextResponse.json({ ok: true, deduplicated: true }); }
    await prisma.analyticsEvent.create({ data: { siteId: site.id, type, blockKey: type === "LINK_CLICK" ? blockKey : null, visitorHash } });
    return NextResponse.json({ ok: true });
  } catch (error) { if (error instanceof RateLimitError) return NextResponse.json({ ok: false }, { status: 429 }); return NextResponse.json({ ok: false }, { status: 500 }); }
}
export async function POST(request: Request) { return recordAnalyticsEvent(request, "PAGE_VIEW"); }
