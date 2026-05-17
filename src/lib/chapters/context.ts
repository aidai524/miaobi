import type { BookPlanResult, ChapterContextNode } from "@/lib/ai/types";
import type { OutlineTreeNode } from "@/lib/outline/service";
import { parseJsonArray } from "@/lib/format";
import type { getProjectPlan } from "@/lib/projects/service";

export function mapBookPlan(plan: NonNullable<Awaited<ReturnType<typeof getProjectPlan>>>): BookPlanResult {
  return {
    positioning: plan.positioning ?? "",
    targetReaderAnalysis: plan.targetReaderAnalysis ?? "",
    marketAngle: plan.marketAngle ?? "",
    corePromise: plan.corePromise ?? "",
    titleSuggestions: parseJsonArray(plan.titleSuggestions),
    subtitleSuggestions: parseJsonArray(plan.subtitleSuggestions),
    sellingPoints: parseJsonArray(plan.sellingPoints),
    structureSuggestion: plan.structureSuggestion ?? "",
    risks: parseJsonArray(plan.risks),
    editorialAdvice: plan.editorialAdvice ?? "",
  };
}

export function flattenOutlineTree(nodes: OutlineTreeNode[]) {
  const result: OutlineTreeNode[] = [];

  function walk(items: OutlineTreeNode[]) {
    for (const item of items) {
      result.push(item);
      walk(item.children);
    }
  }

  walk(nodes);
  return result;
}

export function toChapterContextNode(
  node: Pick<OutlineTreeNode, "title" | "summary" | "writingGoal" | "suggestedWordCount">,
): ChapterContextNode {
  return {
    title: node.title,
    summary: node.summary,
    writingGoal: node.writingGoal,
    suggestedWordCount: node.suggestedWordCount,
  };
}
