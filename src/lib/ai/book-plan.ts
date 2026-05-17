import { z } from "zod";
import { createChatCompletion } from "./client";
import { parseAiJson } from "./json";
import type { BookPlanResult, GenerateBookPlanInput } from "./types";

const bookPlanSchema = z.object({
  positioning: z.string().min(1),
  targetReaderAnalysis: z.string().min(1),
  marketAngle: z.string().min(1),
  corePromise: z.string().min(1),
  titleSuggestions: z.array(z.string()).min(1),
  subtitleSuggestions: z.array(z.string()).min(1),
  sellingPoints: z.array(z.string()).min(1),
  structureSuggestion: z.string().min(1),
  risks: z.array(z.string()).min(1),
  editorialAdvice: z.string().min(1),
});

function buildBookPlanPrompt(input: GenerateBookPlanInput) {
  return `请为一本中文图书生成出版级策划案。

项目信息：
- 图书主题：${input.topic}
- 目标读者：${input.targetReader || "未指定"}
- 书籍类型：${input.bookType || "未指定"}
- 写作风格：${input.writingStyle || "未指定"}
- 预计字数：${input.expectedWordCount ? `${input.expectedWordCount} 字` : "未指定"}

参考创作模型：
${input.referenceModel ? JSON.stringify(input.referenceModel, null, 2) : "无"}

要求：
1. 只做内容层面的定位与编辑建议，不要编造销量、榜单、市场份额等真实市场数据。
2. 输出必须是严格 JSON 对象，不要 Markdown，不要解释。
3. 字段必须完整，数组字段使用字符串数组。
4. 如果提供了参考创作模型，请吸收其结构、语言、内容模式和避免事项，但不要复制原文。

JSON 结构：
{
  "positioning": "图书定位",
  "targetReaderAnalysis": "目标读者分析",
  "marketAngle": "内容切入角度",
  "corePromise": "这本书给读者的核心承诺",
  "titleSuggestions": ["书名建议1", "书名建议2", "书名建议3"],
  "subtitleSuggestions": ["副标题建议1", "副标题建议2", "副标题建议3"],
  "sellingPoints": ["卖点1", "卖点2", "卖点3"],
  "structureSuggestion": "内容结构建议",
  "risks": ["风险1", "风险2"],
  "editorialAdvice": "编辑建议"
}`;
}

async function repairBookPlanJson(raw: string) {
  const repaired = await createChatCompletion({
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "你是 JSON 修复器。只输出严格 JSON 对象，不要 Markdown，不要解释。",
      },
      {
        role: "user",
        content: `下面内容应为图书策划案 JSON，但格式或字段不合规。请修复为指定字段结构，保留原意。\n\n${raw}`,
      },
    ],
  });

  return parseAiJson(repaired, bookPlanSchema);
}

export async function generateBookPlan(input: GenerateBookPlanInput): Promise<{
  data: BookPlanResult;
  raw: string;
}> {
  const raw = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "你是资深图书策划编辑，擅长把选题转化为清晰、可执行、适合原创写作的中文图书策划案。",
      },
      {
        role: "user",
        content: buildBookPlanPrompt(input),
      },
    ],
  });

  try {
    return { data: parseAiJson(raw, bookPlanSchema), raw };
  } catch {
    const repaired = await repairBookPlanJson(raw);
    return { data: repaired, raw };
  }
}
