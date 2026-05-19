import { normalizeStorageKey, putObject } from "@/lib/storage";
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

  const filename = `${Date.now()}_${sanitizeFilename(file.name)}`;
  const storedPath = normalizeStorageKey("uploads", userId, filename);
  const buffer = await file.arrayBuffer();
  await putObject(storedPath, buffer, file.type || undefined);

  const extractedText = await extractTextFromFile(storedPath, file.name);

  return {
    originalFilename: file.name,
    storedPath,
    fileType: extension.replace(/^\./, ""),
    fileSize: file.size,
    extractedText,
  };
}
