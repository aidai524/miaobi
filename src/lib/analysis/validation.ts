import { z } from "zod";

export const analysisTypeSchema = z.enum([
  "author_style",
  "content_structure",
  "book_potential",
  "writing_model",
]);

export const analyzeDocumentSchema = z.object({
  analysisType: analysisTypeSchema.default("writing_model"),
});

export type AnalysisType = z.infer<typeof analysisTypeSchema>;
