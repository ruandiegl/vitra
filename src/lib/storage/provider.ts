import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  remove(key: string): Promise<void>;
}

const safeKey = (key: string) => {
  if (!/^[a-zA-Z0-9/_-]+$/.test(key) || key.includes("..") || key.startsWith("/")) throw new Error("Chave de armazenamento inválida.");
  return key;
};

class LocalStorageProvider implements StorageProvider {
  async put(key: string, body: Buffer) {
    const safe = safeKey(key);
    const filePath = path.join(process.cwd(), "public", "uploads", safe);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body, { flag: "wx" });
    return `/uploads/${safe}`;
  }

  async remove(key: string) {
    const safe = safeKey(key);
    await unlink(path.join(process.cwd(), "public", "uploads", safe)).catch(() => undefined);
  }
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    });
  }

  async put(key: string, body: Buffer, contentType: string) {
    const safe = safeKey(key);
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: safe, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
    const base = process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${this.bucket}`;
    return `${base.replace(/\/$/, "")}/${safe}`;
  }

  async remove(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: safeKey(key) }));
  }
}

export const isS3Configured = () => Boolean(process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_PUBLIC_URL);

export function getStorageProvider(): StorageProvider {
  if (isS3Configured()) return new S3StorageProvider();
  if (process.env.NODE_ENV === "production") throw new Error("Armazenamento S3 não configurado neste ambiente de produção.");
  return new LocalStorageProvider();
}

export const uploadKey = (workspaceId: string, extension: string) => `${workspaceId}/${randomUUID()}.${extension}`;
