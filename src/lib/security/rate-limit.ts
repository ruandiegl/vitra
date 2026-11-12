import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export class RateLimitError extends Error {
  constructor() {
    super("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    this.name = "RateLimitError";
  }
}

/** Best-effort para uma instância. Produção multi-instância exige Redis/Upstash ou WAF. */
export function checkRateLimit(key: string, limit = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) throw new RateLimitError();
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
}

export async function getRequestFingerprint() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
