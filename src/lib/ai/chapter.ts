import { createChatCompletion, createChatCompletionStream, type ChatCompletionInput } from "./client";
import type { GenerateChapterInput, RewriteChapterAction, RewriteChapterInput } from "./types";

function isFictionProject(input: GenerateChapterInput) {
  const text = [input.bookType, input.writingStyle, input.topic, input.plan?.positioning, input.plan?.structureSuggestion]
    .filter(Boolean)
    .join(" ");

  return /小说|故事|长篇|中篇|短篇|网文|悬疑|科幻|奇幻|言情|武侠|历史传奇|人物传记小说|叙事文学/u.test(text);
}

function getTargetWordCount(input: GenerateChapterInput) {
  return input.targetWordCount ?? input.currentNode.suggestedWordCount ?? null;
}

function getMaxTokensForTarget(targetWordCount: number | null) {
  if (!targetWordCount) {
    return 4096;
  }

  return Math.min(12000, Math.max(4096, Math.ceil(targetWordCount * 2.2)));
}

function buildChapterPrompt(input: GenerateChapterInput) {
  const targetWordCount = getTargetWordCount(input);
  const fiction = isFictionProject(input);

  return `请为一本中文图书生成当前目录节点的正文。

图书信息：
- 主题：${input.topic}
- 目标读者：${input.targetReader || "未指定"}
- 书籍类型：${input.bookType || "未指定"}
- 写作风格：${input.writingStyle || "未指定"}
- 预计全书字数：${input.expectedWordCount ? `${input.expectedWordCount} 字` : "未指定"}

策划案：
${input.plan ? JSON.stringify(input.plan, null, 2) : "暂无策划案"}

当前节点：
- 标题：${input.currentNode.title}
- 摘要：${input.currentNode.summary || "未指定"}
- 写作目标：${input.currentNode.writingGoal || "未指定"}
- 建议字数：${input.currentNode.suggestedWordCount ? `${input.currentNode.suggestedWordCount} 字` : "未指定"}
- 本次正文目标字数：${targetWordCount ? `${targetWordCount} 字` : "未指定"}

前一节点标题：${input.previousNode?.title || "无"}
后一节点标题：${input.nextNode?.title || "无"}

写作要求：
1. 只输出正文，不要输出 JSON，不要解释生成过程。
2. 使用 Markdown，允许二级/三级标题、列表、加粗和引用。
3. 内容必须原创，不复制参考材料。
4. 语气和文体必须贴合图书类型、目标读者和写作风格。
5. 避免编造真实市场数据、销量、榜单和不存在的研究结论。
6. 必须尽量接近本次正文目标字数；如果目标字数较大，也要完整展开，不要只写提纲或开头。
7. 正文必须完成当前节点的写作目标，不能以“后文再说”“故事才刚开始”等方式提前截断。
${
  fiction
    ? `8. 当前项目按小说/故事写作处理：必须写成完整可读的叙事情节，不要写成设定说明、剧情梗概或评论。
9. 每一节都要包含场景、人物行动、对话、冲突推进、细节描写和阶段性收束；结尾可以留钩子，但本节主要事件必须写完整。
10. 避免乱码、错别字、无意义字符和残缺句子；人名、地名、器物名和时代细节要前后一致。`
    : `8. 如果建议字数较大，可以先生成结构完整的版本，但必须展开关键论证、案例和细节，不要用空话凑字数。`
}`;
}

function actionInstruction(action: RewriteChapterAction) {
  const map: Record<RewriteChapterAction, string> = {
    expand: "在保持原结构和观点的基础上扩写，增加解释、步骤和细节。",
    shorten: "在保留核心观点的基础上精简，删去重复和空泛表达。",
    plain: "改得更通俗，用更短的句子和更清晰的例子，让非专业读者容易理解。",
    professional: "改得更专业，增强概念准确性、结构严谨性和编辑质感。",
    add_case: "增加贴近中小企业经营场景的案例，案例要合理但不要冒充真实公司。",
    summary: "在正文末尾生成一个简洁小结，提炼关键观点和行动建议。",
    quote: "为正文生成若干适合放在书中的金句，并自然嵌入或附在末尾。",
  };

  return map[action];
}

export async function generateChapter(input: GenerateChapterInput) {
  return createChatCompletion(buildChapterCompletionInput(input));
}

export function generateChapterStream(input: GenerateChapterInput) {
  return createChatCompletionStream(buildChapterCompletionInput(input));
}

function buildChapterCompletionInput(input: GenerateChapterInput): ChatCompletionInput {
  const targetWordCount = getTargetWordCount(input);
  const fiction = isFictionProject(input);

  return {
    responseFormat: "text",
    temperature: fiction ? 0.75 : 0.55,
    maxTokens: getMaxTokensForTarget(targetWordCount),
    timeoutMs: 120_000,
    messages: [
      {
        role: "system",
        content: fiction
          ? "你是资深中文小说作者和编辑，擅长写完整场景、人物行动、冲突推进和有收束的章节正文。"
          : "你是资深中文图书作者和编辑，擅长写作结构清晰、可出版、可执行的非虚构正文。",
      },
      {
        role: "user",
        content: buildChapterPrompt(input),
      },
    ],
  };
}

export async function rewriteChapter(input: RewriteChapterInput) {
  return createChatCompletion({
    responseFormat: "text",
    temperature: 0.45,
    messages: [
      {
        role: "system",
        content: "你是资深中文图书编辑。你会严格根据用户指定动作改写正文，只输出改写后的 Markdown 正文。",
      },
      {
        role: "user",
        content: `章节标题：${input.title}

改写动作：${actionInstruction(input.action)}

原正文：
${input.content}`,
      },
    ],
  });
}
