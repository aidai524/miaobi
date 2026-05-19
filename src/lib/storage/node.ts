import fs from "node:fs/promises";
import path from "node:path";
import { getStorageRoot } from "./paths";

function resolveStorageKey(key: string) {
  const storageRoot = path.resolve(getStorageRoot());
  const filePath = path.resolve(storageRoot, key);

  if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
    throw new Error("存储路径无效");
  }

  return filePath;
}

export async function putObject(key: string, value: ArrayBuffer | Uint8Array | string) {
  const filePath = resolveStorageKey(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  if (typeof value === "string") {
    await fs.writeFile(filePath, value, "utf8");
  } else if (value instanceof ArrayBuffer) {
    await fs.writeFile(filePath, Buffer.from(value));
  } else {
    await fs.writeFile(filePath, Buffer.from(value));
  }
}

export async function getObjectText(key: string) {
  try {
    return await fs.readFile(resolveStorageKey(key), "utf8");
  } catch {
    return null;
  }
}

export async function getObjectArrayBuffer(key: string) {
  try {
    const buffer = await fs.readFile(resolveStorageKey(key));
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch {
    return null;
  }
}
