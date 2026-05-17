import { z } from "zod";

export const saveModelSchema = z.object({
  name: z.string().trim().min(1, "请输入模型名称").max(120, "模型名称不能超过 120 个字").optional(),
});

export const updateModelSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).optional(),
  modelSummary: z.string().max(4000).optional(),
  applicableScenarios: z.string().max(4000).optional(),
  targetReader: z.string().max(4000).optional(),
  structurePattern: z.string().max(4000).optional(),
  languagePattern: z.string().max(4000).optional(),
  contentPattern: z.string().max(4000).optional(),
  writingGuidelines: z.string().max(4000).optional(),
  avoidRules: z.string().max(4000).optional(),
  promptTemplate: z.string().max(8000).optional(),
});

export const createProjectFromModelSchema = z.object({
  topic: z.string().trim().min(2, "请输入至少 2 个字的图书主题").max(300),
  targetReader: z.string().trim().max(500).optional(),
  bookType: z.string().trim().max(500).optional(),
  writingStyle: z.string().trim().max(500).optional(),
  expectedWordCount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
    }),
});
