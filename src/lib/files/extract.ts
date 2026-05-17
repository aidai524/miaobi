import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

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

export async function extractTextFromFile(filePath: string, originalFilename: string) {
  const extension = getFileExtension(originalFilename);

  if (extension === ".txt" || extension === ".md") {
    return fs.readFile(filePath, "utf8");
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (extension === ".pdf") {
    const buffer = await fs.readFile(filePath);
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
