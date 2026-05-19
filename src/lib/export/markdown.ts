import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookPlans, chapters, outlineNodes } from "@/lib/db/schema";
import { parseJsonArray } from "@/lib/format";
import { buildOutlineTree, type OutlineTreeNode } from "@/lib/outline/service";
import { getUserProject } from "@/lib/projects/service";
import { getObjectText, normalizeStorageKey, putObject } from "@/lib/storage";

type ExportChapter = typeof chapters.$inferSelect & {
  outlineNode: typeof outlineNodes.$inferSelect;
};

export type MarkdownExportResult = {
  filename: string;
  filePath: string;
  downloadUrl: string;
  wordCount: number;
  chapterCount: number;
  generatedAt: string;
};

function escapeHeading(value: string) {
  return value.replace(/^#+\s*/, "").trim();
}

function listLine(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderPlanSummary(plan: typeof bookPlans.$inferSelect | null) {
  if (!plan) {
    return "";
  }

  const sections = [
    ["图书定位", plan.positioning],
    ["目标读者", plan.targetReaderAnalysis],
    ["内容切入角度", plan.marketAngle],
    ["核心承诺", plan.corePromise],
    ["卖点", listLine(parseJsonArray(plan.sellingPoints))],
    ["结构建议", plan.structureSuggestion],
    ["编辑建议", plan.editorialAdvice],
  ].filter(([, content]) => String(content ?? "").trim());

  if (!sections.length) {
    return "";
  }

  return ["## 策划案摘要", ...sections.map(([title, content]) => `### ${title}\n\n${content}`)].join("\n\n");
}

function flattenOutlineTree(nodes: OutlineTreeNode[]) {
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

function renderOutline(nodes: OutlineTreeNode[]) {
  const lines: string[] = [];

  function walk(items: OutlineTreeNode[], prefix: number[] = []) {
    items.forEach((item, index) => {
      const current = [...prefix, index + 1];
      lines.push(`${"  ".repeat(item.level - 1)}${current.join(".")}. ${item.title}`);
      if (item.children.length) {
        walk(item.children, current);
      }
    });
  }

  walk(nodes);
  return ["## 目录", lines.join("\n") || "暂无目录"].join("\n\n");
}

function renderChapter(node: OutlineTreeNode, chapter: ExportChapter | undefined) {
  const level = Math.min(node.level + 1, 6);
  const heading = `${"#".repeat(level)} ${escapeHeading(chapter?.title || node.title)}`;
  const parts = [heading];
  const content = chapter?.content?.trim();

  if (content) {
    parts.push(content);
  } else {
    parts.push("> 本节暂无正文。");
  }

  return parts.join("\n\n");
}

function timestampForFilename(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function exportProjectMarkdown(projectId: number, userId: number): Promise<MarkdownExportResult | null> {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const [planRows, outlineRows, chapterRows] = await Promise.all([
    db.select().from(bookPlans).where(eq(bookPlans.projectId, projectId)).limit(1),
    db
      .select()
      .from(outlineNodes)
      .where(eq(outlineNodes.projectId, projectId))
      .orderBy(asc(outlineNodes.level), asc(outlineNodes.sortOrder), asc(outlineNodes.id)),
    db
      .select({
        chapter: chapters,
        outlineNode: outlineNodes,
      })
      .from(chapters)
      .innerJoin(outlineNodes, eq(chapters.outlineNodeId, outlineNodes.id))
      .where(and(eq(chapters.projectId, projectId), eq(outlineNodes.projectId, projectId))),
  ]);

  const outlineTree = buildOutlineTree(outlineRows);
  const orderedNodes = flattenOutlineTree(outlineTree);
  const chapterByNodeId = new Map<number, ExportChapter>(
    chapterRows.map((row) => [row.outlineNode.id, { ...row.chapter, outlineNode: row.outlineNode }]),
  );

  const title = project.title || project.topic;
  const sections = [
    `# ${escapeHeading(title)}`,
    renderPlanSummary(planRows[0] ?? null),
    renderOutline(outlineTree),
    "## 正文",
    ...orderedNodes.map((node) => renderChapter(node, chapterByNodeId.get(node.id))),
  ].filter((section) => section.trim());
  const markdown = `${sections.join("\n\n---\n\n")}\n`;
  const generatedAt = new Date();
  const filename = `book_${timestampForFilename(generatedAt)}.md`;
  const filePath = normalizeStorageKey("exports", projectId, filename);

  await putObject(filePath, markdown, "text/markdown; charset=utf-8");

  return {
    filename,
    filePath,
    downloadUrl: `/api/projects/${projectId}/exports/${filename}`,
    wordCount: markdown.length,
    chapterCount: orderedNodes.length,
    generatedAt: generatedAt.toISOString(),
  };
}

export async function getProjectExportFile(projectId: number, userId: number, filename: string) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  if (!/^book_[A-Za-z0-9]+\.md$/.test(filename)) {
    return null;
  }

  const filePath = normalizeStorageKey("exports", projectId, filename);
  const content = await getObjectText(filePath);
  if (!content) {
    return null;
  }

  return { filename, content };
}
