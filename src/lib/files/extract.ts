import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { isCloudflareRuntime } from "@/lib/runtime";
import { getObjectArrayBuffer, getObjectText } from "@/lib/storage";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const SUPPORTED_EXTENSIONS = [".txt", ".md", ".docx", ".pdf"] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function getFileExtension(filename: string) {
  return path.extname(filename).toLowerCase();
}

export function isSupportedExtension(extension: string): extension is SupportedExtension {
  return SUPPORTED_EXTENSIONS.includes(extension as SupportedExtension);
}

export function sanitizeFilename(filename: string) {
  const parsed = path.parse(filename);
  const base = parsed.name
    .normalize("NFKD")
    .replace(/[^\w\u4e00-\u9fa5.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  const ext = parsed.ext.toLowerCase();
  return `${base || "document"}${ext}`;
}

export async function extractTextFromFile(storedKey: string, originalFilename: string) {
  const extension = getFileExtension(originalFilename);

  if (extension === ".txt" || extension === ".md") {
    return (await getObjectText(storedKey)) ?? "";
  }

  if (extension === ".docx") {
    if (isCloudflareRuntime()) {
      throw new Error("Cloudflare 部署暂不支持 docx 解析，请先上传 txt 或 md 文件");
    }

    const arrayBuffer = await getObjectArrayBuffer(storedKey);
    if (!arrayBuffer) {
      return "";
    }
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return result.value;
  }

  if (extension === ".pdf") {
    if (isCloudflareRuntime()) {
      throw new Error("Cloudflare 部署暂不支持 pdf 解析，请先上传 txt 或 md 文件");
    }

    const arrayBuffer = await getObjectArrayBuffer(storedKey);
    if (!arrayBuffer) {
      return "";
    }
    const buffer = Buffer.from(arrayBuffer);
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("暂不支持该文件类型");
}
