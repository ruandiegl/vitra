-- Enforce one slug per site for publishable URLs.
CREATE UNIQUE INDEX IF NOT EXISTS "Site_slug_key" ON "Site"("slug");
