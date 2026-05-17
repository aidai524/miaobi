import fs from "node:fs/promises";
import path from "node:path";
import { getUploadsPath } from "@/lib/storage/paths";
import {
  extractTextFromFile,
  getFileExtension,
  isSupportedExtension,
  MAX_UPLOAD_BYTES,
  sanitizeFilename,
} from "./extract";

export async function saveUploadedFile(userId: number, file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("文件不能超过 50MB");
  }

  const extension = getFileExtension(file.name);
  if (!isSupportedExtension(extension)) {
    throw new Error("仅支持 txt、md、docx、pdf 文件");
  }

  const userDir = path.join(getUploadsPath(), String(userId));
  await fs.mkdir(userDir, { recursive: true });

  const filename = `${Date.now()}_${sanitizeFilename(file.name)}`;
  const storedPath = path.join(userDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(storedPath, buffer);

  const extractedText = await extractTextFromFile(storedPath, file.name);

  return {
    originalFilename: file.name,
    storedPath,
    fileType: extension.replace(/^\./, ""),
    fileSize: file.size,
    extractedText,
  };
}
