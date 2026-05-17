import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { textAnalyses, uploadedDocuments } from "@/lib/db/schema";
import type { TextAnalysisResult } from "@/lib/ai/types";

export async function listUserDocuments(userId: number) {
  return db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.userId, userId))
    .orderBy(desc(uploadedDocuments.createdAt));
}

export async function getUserDocument(documentId: number, userId: number) {
  const rows = await db
    .select()
    .from(uploadedDocuments)
    .where(and(eq(uploadedDocuments.id, documentId), eq(uploadedDocuments.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createDocumentRecord(input: {
  userId: number;
  originalFilename: string;
  storedPath: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  status?: string;
}) {
  const rows = await db.insert(uploadedDocuments).values(input).returning();
  return rows[0];
}

export async function markDocumentStatus(documentId: number, userId: number, status: string) {
  const rows = await db
    .update(uploadedDocuments)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(uploadedDocuments.id, documentId), eq(uploadedDocuments.userId, userId)))
    .returning();

  return rows[0] ?? null;
}

export async function createTextAnalysis(input: {
  userId: number;
  documentId: number;
  analysisType: string;
  result: TextAnalysisResult;
  raw: string;
}) {
  const rows = await db
    .insert(textAnalyses)
    .values({
      userId: input.userId,
      documentId: input.documentId,
      analysisType: input.analysisType,
      summary: input.result.summary,
      contentTopics: JSON.stringify(input.result.contentTopics),
      readerProfile: input.result.readerProfile,
      structureAnalysis: input.result.structureAnalysis,
      styleAnalysis: input.result.styleAnalysis,
      reusableTraits: JSON.stringify(input.result.reusableTraits),
      writingAdvice: JSON.stringify(input.result.writingAdvice),
      aiRawOutput: input.raw,
    })
    .returning();

  return rows[0];
}

export async function getUserAnalysis(analysisId: number, userId: number) {
  const rows = await db
    .select({
      analysis: textAnalyses,
      document: uploadedDocuments,
    })
    .from(textAnalyses)
    .innerJoin(uploadedDocuments, eq(textAnalyses.documentId, uploadedDocuments.id))
    .where(and(eq(textAnalyses.id, analysisId), eq(textAnalyses.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}
