import { getCloudflareEnv } from "@/lib/cloudflare/env";

function getBucket() {
  const bucket = getCloudflareEnv().AI_BOOK_BUCKET;
  if (!bucket) {
    throw new Error("Cloudflare R2 binding AI_BOOK_BUCKET is not configured");
  }
  return bucket;
}

export async function putObject(key: string, value: ArrayBuffer | Uint8Array | string, contentType?: string) {
  await getBucket().put(key, value, contentType ? { httpMetadata: { contentType } } : undefined);
}

export async function getObjectText(key: string) {
  const object = await getBucket().get(key);
  return object ? object.text() : null;
}

export async function getObjectArrayBuffer(key: string) {
  const object = await getBucket().get(key);
  return object ? object.arrayBuffer() : null;
}
