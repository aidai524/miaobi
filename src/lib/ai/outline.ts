import { z } from "zod";
import { createChatCompletion } from "./client";
import { parseAiJson } from "./json";
import type { GenerateOutlineInput, OutlineNodeResult, OutlineResult } from "./types";

const outlineNodeSchema: z.ZodType<OutlineNodeResult> = z.lazy(() =>
  z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    writingGoal: z.string().min(1),
    suggestedWordCount: z.number().int().positive().nullable().optional(),
    children: z.array(outlineNodeSchema).optional(),
  }),
);

const outlineSchema: z.ZodType<OutlineResult> = z.object({
  nodes: z.array(outlineNodeSchema).min(1),
});

function buildPlanContext(input: GenerateOutlineInput) {
  return JSON.stringify(
    {
      topic: input.topic,
      targetReader: input.targetReader,
      bookType: input.bookType,
      writingStyle: input.writingStyle,
      expectedWordCount: input.expectedWordCount,
      plan: input.plan,
    },
    null,
    2,
  );
}

function buildOutlinePrompt(input: GenerateOutlineInput) {
  return `请基于以下图书项目信息和策划案，生成一本中文图书的三级目录。

上下文：
${buildPlanContext(input)}

要求：
1. 必须输出严格 JSON 对象，不要 Markdown，不要解释。
2. 顶层 nodes 表示“部分/篇/模块”，每个顶层节点应有若干章节，每个章节应有若干小节。
3. 尽量做到三级结构完整，允许少数节点因为内容需要只有两级，但不要只输出一级。
4. 每个节点都必须有 title、summary、writingGoal、suggestedWordCount。
5. 字数建议要与预计总字数匹配；若预计字数缺失，请按 60,000 到 80,000 字的商业图书规划。
6. 目录标题要可直接用于出版书稿，不要使用泛泛的“第一章 内容”。

JSON 结构：
{
  "nodes": [
    {
      "title": "第一部分 标题",
      "summary": "本部分内容摘要",
      "writingGoal": "本部分写作目标",
      "suggestedWordCount": 12000,
      "children": [
        {
          "title": "第1章 标题",
          "summary": "章节摘要",
          "writingGoal": "章节写作目标",
          "suggestedWordCount": 5000,
          "children": [
            {
              "title": "1.1 小节标题",
              "summary": "小节摘要",
              "writingGoal": "小节写作目标",
              "suggestedWordCount": 1500
            }
          ]
        }
      ]
    }
  ]
}`;
}

async function repairOutlineJson(raw: string) {
  const repaired = await createChatCompletion({
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "你是 JSON 修复器。只输出严格 JSON 对象，不要 Markdown，不要解释。",
      },
      {
        role: "user",
        content: `下面内容应为三级图书目录 JSON，但格式或字段不合规。请修复为 { "nodes": [...] } 结构，保留原意。\n\n${raw}`,
      },
    ],
  });

  return outlineSchema.parse(parseAiJson(repaired, outlineSchema));
}

export async function generateOutline(input: GenerateOutlineInput): Promise<{
  data: OutlineResult;
  raw: string;
}> {
  const raw = await createChatCompletion({
    temperature: 0.35,
    messages: [
      {
        role: "system",
        content:
          "你是资深图书策划编辑，擅长把策划案拆解为清晰、有层次、可直接进入写作的中文图书三级目录。",
      },
      {
        role: "user",
        content: buildOutlinePrompt(input),
      },
    ],
  });

  try {
    return { data: parseAiJson(raw, outlineSchema), raw };
  } catch {
    const repaired = await repairOutlineJson(raw);
    return { data: repaired, raw };
  }
}
