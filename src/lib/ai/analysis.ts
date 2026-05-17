import { z } from "zod";
import { createChatCompletion } from "./client";
import { parseAiJson } from "./json";
import type { AnalyzeTextInput, TextAnalysisResult } from "./types";

const textAnalysisSchema = z.object({
  summary: z.string().min(1),
  contentTopics: z.array(z.string()).min(1),
  readerProfile: z.string().min(1),
  structureAnalysis: z.string().min(1),
  styleAnalysis: z.string().min(1),
  reusableTraits: z.array(z.string()).min(1),
  writingAdvice: z.array(z.string()).min(1),
});

const CHUNK_SIZE = 12_000;
const MAX_DIRECT_TEXT = 24_000;

function chunkText(text: string) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += CHUNK_SIZE) {
    chunks.push(text.slice(index, index + CHUNK_SIZE));
  }
  return chunks;
}

async function summarizeChunk(text: string, index: number, total: number) {
  return createChatCompletion({
    responseFormat: "text",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "你是中文文本分析助手。请提炼结构、主题、风格和可复用写作特征，不复制原文。",
      },
      {
        role: "user",
        content: `这是长文本第 ${index + 1}/${total} 段。请用 500 字以内总结：主题、结构、风格、读者、可复用特征。\n\n${text}`,
      },
    ],
  });
}

function buildAnalysisPrompt(input: AnalyzeTextInput) {
  return `请分析以下中文文本，为后续原创图书创作服务。

分析目标：${input.analysisType || "生成创作模型"}

要求：
1. 只输出严格 JSON 对象，不要 Markdown，不要解释。
2. 提炼结构、方法、风格和可复用特征，不复制原文。
3. 如果文本适合出书，请指出适合的读者和结构方向；如果不适合，也给出改造建议。
4. 不要编造作者身份、市场销量或真实出版数据。

JSON 结构：
{
  "summary": "内容摘要",
  "contentTopics": ["主要主题1", "主要主题2"],
  "readerProfile": "读者定位",
  "structureAnalysis": "结构特点",
  "styleAnalysis": "表达风格",
  "reusableTraits": ["可复用创作特征1", "可复用创作特征2"],
  "writingAdvice": ["写作建议1", "写作建议2"]
}

待分析文本：
${input.text}`;
}

async function repairAnalysisJson(raw: string) {
  const repaired = await createChatCompletion({
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "你是 JSON 修复器。只输出严格 JSON 对象，不要 Markdown，不要解释。",
      },
      {
        role: "user",
        content: `下面内容应为文本分析 JSON，但格式或字段不合规。请修复为指定字段结构，保留原意。\n\n${raw}`,
      },
    ],
  });

  return parseAiJson(repaired, textAnalysisSchema);
}

export async function analyzeText(input: AnalyzeTextInput): Promise<{
  data: TextAnalysisResult;
  raw: string;
}> {
  const normalized = input.text.trim();
  if (!normalized) {
    throw new Error("文本内容为空，无法分析");
  }

  let textForAnalysis = normalized;
  if (normalized.length > MAX_DIRECT_TEXT) {
    const chunks = chunkText(normalized);
    const summaries: string[] = [];
    for (let index = 0; index < chunks.length; index += 1) {
      summaries.push(await summarizeChunk(chunks[index], index, chunks.length));
    }
    textForAnalysis = summaries.join("\n\n---\n\n");
  }

  const raw = await createChatCompletion({
    messages: [
      {
        role: "system",
        content: "你是资深图书编辑和文本分析师，擅长把资料提炼为原创图书创作模型。",
      },
      {
        role: "user",
        content: buildAnalysisPrompt({
          text: textForAnalysis,
          analysisType: input.analysisType,
        }),
      },
    ],
  });

  try {
    return { data: parseAiJson(raw, textAnalysisSchema), raw };
  } catch {
    const repaired = await repairAnalysisJson(raw);
    return { data: repaired, raw };
  }
}
