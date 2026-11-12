import type { ReactNode } from "react";
import { requireWorkspace } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getAccessState } from "@/lib/billing/access";
import { AppShell } from "@/components/dashboard/app-shell";

export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, membership } = await requireWorkspace();
  const subscription = await prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId } });
  const access = getAccessState(subscription);
  return <AppShell user={{ name: user.name, email: user.email }} emailVerified={Boolean(user.emailVerified)} subscriptionLabel={access.label} isAdmin={user.role !== "CUSTOMER"}>{children}</AppShell>;
}
