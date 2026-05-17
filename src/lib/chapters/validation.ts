import { z } from "zod";

export const chapterUpdateSchema = z.object({
  title: z.string().trim().min(1, "请输入标题").max(200, "标题不能超过 200 个字").optional(),
  content: z.string().max(300_000, "正文过长").optional(),
  createVersion: z.boolean().optional(),
});

export const chapterRewriteSchema = z.object({
  action: z.enum(["expand", "shorten", "plain", "professional", "add_case", "summary", "quote"]),
});

export const restoreVersionSchema = z.object({
  versionId: z.number().int().positive(),
});

export type ChapterUpdateInput = z.infer<typeof chapterUpdateSchema>;
export type ChapterRewriteInput = z.infer<typeof chapterRewriteSchema>;
