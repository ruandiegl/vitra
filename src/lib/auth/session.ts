import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Membership, User, Workspace } from "@prisma/client";

export type WorkspaceContext = {
  user: User;
  membership: Membership & { workspace: Workspace };
};

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE" || user.sessionVersion !== session.user.sessionVersion) return null;
  return user;
}

export async function requireUser(returnTo = "/app") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return membership ? { user, membership } : null;
}

export async function requireWorkspace(returnTo = "/app") {
  const context = await getWorkspaceContext();
  if (!context) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return context;
}

export async function requireAdmin(supportAllowed = false) {
  const user = await requireUser("/admin");
  if (user.role === "SUPER_ADMIN" || (supportAllowed && user.role === "SUPPORT")) return user;
  redirect("/app");
}

export async function getOwnedSite(siteId: string, workspaceId: string) {
  return prisma.site.findFirst({
    where: { id: siteId, workspaceId },
    include: {
      draftVersion: { include: { blocks: { orderBy: { position: "asc" } }, theme: true } },
      publishedVersion: { include: { blocks: { orderBy: { position: "asc" } }, theme: true } },
    },
  });
}
