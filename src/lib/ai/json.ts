import { z } from "zod";

export class AiJsonParseError extends Error {
  constructor(
    message: string,
    public readonly raw: string,
  ) {
    super(message);
  }
}

export function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new AiJsonParseError("AI 未返回 JSON 对象", text);
}

export function parseAiJson<T>(text: string, schema: z.ZodType<T>) {
  try {
    const json = JSON.parse(extractJsonObject(text));
    return schema.parse(json);
  } catch (error) {
    if (error instanceof AiJsonParseError) {
      throw error;
    }

    throw new AiJsonParseError(error instanceof Error ? error.message : "AI JSON 解析失败", text);
  }
}
