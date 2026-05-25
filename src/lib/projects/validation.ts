import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : undefined));

export const createProjectSchema = z.object({
  topic: z.string().trim().min(2, "请输入至少 2 个字的图书主题").max(1000, "图书主题不能超过 1000 个字"),
  targetReader: optionalText,
  bookType: optionalText,
  writingStyle: optionalText,
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
  referenceModelId: z.number().int().positive().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  title: optionalText,
  status: z.enum(["draft", "planning", "outlined", "writing", "exported", "archived"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
