import { randomBytes, createHmac } from "crypto";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 10 * 1024 * 1024;

export function assertAllowedUpload(mimeType: string, sizeBytes: number) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error("File type not allowed");
  }
  if (sizeBytes > MAX_BYTES) {
    throw new Error("File too large (max 10MB)");
  }
}

function localRoot() {
  return path.resolve(process.env.STORAGE_LOCAL_PATH ?? ".uploads");
}

export async function storeLocalFile(
  key: string,
  data: Buffer,
  mimeType: string,
) {
  assertAllowedUpload(mimeType, data.byteLength);
  const full = path.join(localRoot(), key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
  return key;
}

/** Short-lived signed URL for private verification documents (HMAC demo). */
export function createSignedFileUrl(storageKey: string, ttlSeconds = 300) {
  const secret = process.env.AUTH_SECRET ?? "dev";
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${storageKey}:${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
  return `${base}/api/files/${encodeURIComponent(storageKey)}?exp=${exp}&sig=${sig}`;
}

export function verifySignedFileUrl(storageKey: string, exp: string, sig: string) {
  const secret = process.env.AUTH_SECRET ?? "dev";
  const expNum = Number(exp);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) return false;
  const payload = `${storageKey}:${exp}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === sig;
}

export function newStorageKey(prefix: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${Date.now()}-${randomBytes(8).toString("hex")}-${safe}`;
}

export async function readLocalFile(storageKey: string) {
  const full = path.join(localRoot(), storageKey);
  return fs.readFile(full);
}
