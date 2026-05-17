import { z } from "zod";
import { createChatCompletion } from "./client";
import { parseAiJson } from "./json";
import type { CreateWritingModelInput, WritingModelResult } from "./types";

const flexibleText = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value.join("\n") : value))
  .pipe(z.string().min(1));

const writingModelSchema = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  modelSummary: flexibleText,
  applicableScenarios: flexibleText,
  targetReader: flexibleText,
  structurePattern: flexibleText,
  languagePattern: flexibleText,
  contentPattern: flexibleText,
  writingGuidelines: flexibleText,
  avoidRules: flexibleText,
  promptTemplate: flexibleText,
});

function buildWritingModelPrompt(input: CreateWritingModelInput) {
  return `请把以下文本分析结果整理成一个可复用的“创作模型”。

用户指定名称：${input.name || "未指定"}

分析结果：
${JSON.stringify(input.analysis, null, 2)}

要求：
1. 只输出严格 JSON 对象，不要 Markdown，不要解释。
2. 模型服务于原创写作，只提炼结构、风格、表达方法和创作约束，不复制原文。
3. promptTemplate 要能直接作为后续生成图书策划、目录、正文的参考提示词。

JSON 结构：
{
  "name": "模型名称",
  "tags": ["标签1", "标签2", "标签3"],
  "modelSummary": "模型摘要",
  "applicableScenarios": "适用场景",
  "targetReader": "目标读者",
  "structurePattern": "结构模式",
  "languagePattern": "语言模式",
  "contentPattern": "内容模式",
  "writingGuidelines": "写作指南",
  "avoidRules": "避免事项",
  "promptTemplate": "可复用提示词模板"
}`;
}

async function repairWritingModelJson(raw: string) {
  const repaired = await createChatCompletion({
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "你是 JSON 修复器。只输出严格 JSON 对象，不要 Markdown，不要解释。",
      },
      {
        role: "user",
        content: `下面内容应为创作模型 JSON，但格式或字段不合规。请修复为指定字段结构，保留原意。\n\n${raw}`,
      },
    ],
  });

  return parseAiJson(repaired, writingModelSchema);
}

export async function createWritingModel(input: CreateWritingModelInput): Promise<{
  data: WritingModelResult;
  raw: string;
}> {
  const raw = await createChatCompletion({
    temperature: 0.25,
    messages: [
      {
        role: "system",
        content: "你是资深图书编辑和写作教练，擅长把文本分析沉淀为可复用的原创写作模型。",
      },
      {
        role: "user",
        content: buildWritingModelPrompt(input),
      },
    ],
  });

  try {
    return { data: parseAiJson(raw, writingModelSchema), raw };
  } catch {
    const repaired = await repairWritingModelJson(raw);
    return { data: repaired, raw };
  }
}
