import { z } from "zod";

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalId = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  });

export const publicBookQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  author: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
});

export const publicAuthorQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  field: z.string().trim().max(100).optional(),
});

export const upsertPublicAuthorSchema = z.object({
  name: z.string().trim().min(1, "请输入作者姓名").max(200, "作者姓名不能超过 200 个字"),
  bio: optionalText(3000),
  mainFields: optionalText(1000),
  representativeBooks: optionalText(1000),
  writingTraits: optionalText(2000),
  tags: optionalText(1000),
});

export const upsertPublicBookSchema = z.object({
  title: z.string().trim().min(1, "请输入书名").max(300, "书名不能超过 300 个字"),
  subtitle: optionalText(500),
  authorName: optionalText(300),
  primaryAuthorId: optionalId,
  publisher: optionalText(200),
  publishDate: optionalText(100),
  category: optionalText(100),
  tags: optionalText(1000),
  summary: optionalText(5000),
  tableOfContents: optionalText(10000),
  recommendationReason: optionalText(3000),
  coverUrl: optionalText(1000),
  sourceNote: optionalText(1000),
});

export const importPublicAuthorsSchema = z.union([
  z.array(upsertPublicAuthorSchema).min(1, "请至少提供一位作者"),
  z.object({ authors: z.array(upsertPublicAuthorSchema).min(1, "请至少提供一位作者") }),
]);

export const importPublicBooksSchema = z.union([
  z.array(upsertPublicBookSchema).min(1, "请至少提供一本图书"),
  z.object({ books: z.array(upsertPublicBookSchema).min(1, "请至少提供一本图书") }),
]);

export type PublicBookQuery = z.infer<typeof publicBookQuerySchema>;
export type PublicAuthorQuery = z.infer<typeof publicAuthorQuerySchema>;
export type UpsertPublicBookInput = z.infer<typeof upsertPublicBookSchema>;
export type UpsertPublicAuthorInput = z.infer<typeof upsertPublicAuthorSchema>;
