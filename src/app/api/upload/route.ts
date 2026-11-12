import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/auth/session";
import { getStorageProvider, uploadKey } from "@/lib/storage/provider";
import { MAX_IMAGE_BYTES, validateImageBytes } from "@/lib/storage/validation";
import { checkRateLimit, getRequestFingerprint, RateLimitError } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const context = await getWorkspaceContext();
    if (!context) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    checkRateLimit(`upload:${await getRequestFingerprint()}:${context.user.id}`, 40, 10 * 60 * 1000);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Envie uma imagem PNG, JPEG ou WebP." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { extension, contentType } = validateImageBytes(buffer);
    const key = uploadKey(context.membership.workspaceId, extension);
    const url = await getStorageProvider().put(key, buffer, contentType);
    return NextResponse.json({ url, size: buffer.length, limit: MAX_IMAGE_BYTES });
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    const message = error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
