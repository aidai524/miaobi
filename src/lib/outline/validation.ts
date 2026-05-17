import { z } from "zod";

export const outlineNodeInputSchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(1, "请输入标题").max(200, "标题不能超过 200 个字"),
  summary: z.string().trim().max(2000, "摘要不能超过 2000 个字").optional(),
  writingGoal: z.string().trim().max(2000, "写作目标不能超过 2000 个字").optional(),
  suggestedWordCount: z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((value) => {
      if (value === null || value === undefined || value === "") {
        return null;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
    }),
});

export const outlineNodeUpdateSchema = outlineNodeInputSchema.partial().extend({
  sortOrder: z.number().int().min(0).optional(),
});

export type OutlineNodeInput = z.infer<typeof outlineNodeInputSchema>;
export type OutlineNodeUpdateInput = z.infer<typeof outlineNodeUpdateSchema>;
