import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { textAnalyses, writingModels } from "@/lib/db/schema";
import { parseJsonArray } from "@/lib/format";
import type { TextAnalysisResult, WritingModelContext, WritingModelResult } from "@/lib/ai/types";
import type { updateModelSchema } from "./validation";
import type { z } from "zod";

export function mapAnalysisToResult(
  analysis: typeof textAnalyses.$inferSelect,
): TextAnalysisResult & { analysisType?: string | null } {
  return {
    analysisType: analysis.analysisType,
    summary: analysis.summary ?? "",
    contentTopics: parseJsonArray(analysis.contentTopics),
    readerProfile: analysis.readerProfile ?? "",
    structureAnalysis: analysis.structureAnalysis ?? "",
    styleAnalysis: analysis.styleAnalysis ?? "",
    reusableTraits: parseJsonArray(analysis.reusableTraits),
    writingAdvice: parseJsonArray(analysis.writingAdvice),
  };
}

export async function getAnalysisForModel(analysisId: number, userId: number) {
  const rows = await db
    .select()
    .from(textAnalyses)
    .where(and(eq(textAnalyses.id, analysisId), eq(textAnalyses.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createModelFromResult(input: {
  userId: number;
  analysisId: number;
  sourceType: string;
  result: WritingModelResult;
}) {
  const rows = await db
    .insert(writingModels)
    .values({
      userId: input.userId,
      name: input.result.name,
      tags: JSON.stringify(input.result.tags),
      sourceType: input.sourceType,
      sourceAnalysisId: input.analysisId,
      modelSummary: input.result.modelSummary,
      applicableScenarios: input.result.applicableScenarios,
      targetReader: input.result.targetReader,
      structurePattern: input.result.structurePattern,
      languagePattern: input.result.languagePattern,
      contentPattern: input.result.contentPattern,
      writingGuidelines: input.result.writingGuidelines,
      avoidRules: input.result.avoidRules,
      promptTemplate: input.result.promptTemplate,
    })
    .returning();

  return rows[0];
}

export async function listUserModels(userId: number) {
  return db
    .select()
    .from(writingModels)
    .where(eq(writingModels.userId, userId))
    .orderBy(desc(writingModels.createdAt));
}

export async function getUserModel(modelId: number, userId: number) {
  const rows = await db
    .select()
    .from(writingModels)
    .where(and(eq(writingModels.id, modelId), eq(writingModels.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateUserModel(
  modelId: number,
  userId: number,
  input: z.infer<typeof updateModelSchema>,
) {
  const model = await getUserModel(modelId, userId);
  if (!model) {
    return null;
  }

  const { tags, ...fields } = input;
  const rows = await db
    .update(writingModels)
    .set({
      ...fields,
      ...(tags ? { tags: JSON.stringify(tags) } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(writingModels.id, modelId), eq(writingModels.userId, userId)))
    .returning();

  return rows[0] ?? null;
}

export async function deleteUserModel(modelId: number, userId: number) {
  const model = await getUserModel(modelId, userId);
  if (!model) {
    return false;
  }

  await db.delete(writingModels).where(and(eq(writingModels.id, modelId), eq(writingModels.userId, userId)));
  return true;
}

export function mapModelContext(model: typeof writingModels.$inferSelect | null | undefined): WritingModelContext | null {
  if (!model) {
    return null;
  }

  return {
    name: model.name,
    tags: parseJsonArray(model.tags),
    modelSummary: model.modelSummary,
    applicableScenarios: model.applicableScenarios,
    targetReader: model.targetReader,
    structurePattern: model.structurePattern,
    languagePattern: model.languagePattern,
    contentPattern: model.contentPattern,
    writingGuidelines: model.writingGuidelines,
    avoidRules: model.avoidRules,
    promptTemplate: model.promptTemplate,
  };
}
