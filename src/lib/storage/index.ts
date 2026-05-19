import path from "node:path";
import { getAppRuntime } from "@/lib/runtime";

export function normalizeStorageKey(...parts: Array<string | number>) {
  return parts
    .map((part) => String(part).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

async function getNodeStorage() {
  return import("./node");
}

async function getCloudflareStorage() {
  return import("./cloudflare");
}

async function getStorage() {
  return getAppRuntime() === "cloudflare" ? getCloudflareStorage() : getNodeStorage();
}

export async function putObject(key: string, value: ArrayBuffer | Uint8Array | string, contentType?: string) {
  const storage = await getStorage();
  return storage.putObject(key, value, contentType);
}

export async function getObjectText(key: string) {
  const storage = await getStorage();
  return storage.getObjectText(key);
}

export async function getObjectArrayBuffer(key: string) {
  const storage = await getStorage();
  return storage.getObjectArrayBuffer(key);
}

export function basenameFromKey(key: string) {
  return path.posix.basename(key);
}
