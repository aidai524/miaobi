import { createChatCompletion } from "./client";
import type { GenerateChapterInput, RewriteChapterAction, RewriteChapterInput } from "./types";

function buildChapterPrompt(input: GenerateChapterInput) {
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

前一节点标题：${input.previousNode?.title || "无"}
后一节点标题：${input.nextNode?.title || "无"}

写作要求：
1. 只输出正文，不要输出 JSON，不要解释生成过程。
2. 使用 Markdown，允许二级/三级标题、列表、加粗和引用。
3. 内容必须原创，不复制参考材料。
4. 语气贴合目标读者，专业但通俗，尽量提供可执行方法和具体例子。
5. 避免编造真实市场数据、销量、榜单和不存在的研究结论。
6. 如果建议字数较大，可以先生成结构完整的版本，不要用空话凑字数。`;
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
  return createChatCompletion({
    responseFormat: "text",
    temperature: 0.55,
    messages: [
      {
        role: "system",
        content: "你是资深中文图书作者和编辑，擅长写作结构清晰、可出版、可执行的非虚构正文。",
      },
      {
        role: "user",
        content: buildChapterPrompt(input),
      },
    ],
  });
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
