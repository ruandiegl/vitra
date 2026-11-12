import type { Prisma } from "@prisma/client";
import { siteConfigSchema, siteSnapshotSchema } from "./validation";
import type { SiteConfig, SiteSnapshot } from "./types";

export function parseSiteSnapshot(value: Prisma.JsonValue | unknown): SiteSnapshot {
  return siteSnapshotSchema.parse(value) as unknown as SiteSnapshot;
}

export function snapshotFromVersion(version: { config: Prisma.JsonValue; theme: unknown; blocks: unknown[] }): SiteSnapshot {
  const theme = version.theme && typeof version.theme === "object" ? version.theme as Record<string, unknown> : {};
  return siteSnapshotSchema.parse({ config: version.config, theme: { ...theme, backgroundImage: theme.backgroundImage ?? "" }, blocks: version.blocks }) as unknown as SiteSnapshot;
}

export function asSiteConfig(value: Prisma.JsonValue): SiteConfig {
  return siteConfigSchema.parse(value);
}
