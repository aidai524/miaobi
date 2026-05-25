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

export type ProjectExportResult = MarkdownExportResult & {
  format: "markdown" | "word";
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
  } else if (!node.children.length) {
    parts.push("> 本节暂无正文。");
  }

  return parts.join("\n\n");
}

function renderExportSections(
  project: NonNullable<Awaited<ReturnType<typeof getUserProject>>>,
  plan: typeof bookPlans.$inferSelect | null,
  outlineTree: OutlineTreeNode[],
  chapterByNodeId: Map<number, ExportChapter>,
) {
  const title = project.title || project.topic;
  const orderedNodes = flattenOutlineTree(outlineTree);

  return [
    `# ${escapeHeading(title)}`,
    renderPlanSummary(plan),
    renderOutline(outlineTree),
    "## 正文",
    ...orderedNodes.map((node) => renderChapter(node, chapterByNodeId.get(node.id))),
  ].filter((section) => section.trim());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownInlineToHtml(value: string) {
  return escapeHtml(value).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let listOpen = false;

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(markdownInlineToHtml).join("<br />")}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${markdownInlineToHtml(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${markdownInlineToHtml(listItem[1])}</li>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${markdownInlineToHtml(trimmed.replace(/^>\s*/, ""))}</blockquote>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

function renderWordDocument(markdown: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Book Export</title>
  <style>
    body { font-family: "SimSun", "Songti SC", serif; font-size: 12pt; line-height: 1.8; color: #111827; }
    h1 { font-size: 24pt; text-align: center; margin: 0 0 24pt; }
    h2 { font-size: 18pt; margin: 24pt 0 10pt; border-bottom: 1px solid #d1d5db; padding-bottom: 4pt; }
    h3 { font-size: 15pt; margin: 18pt 0 8pt; }
    h4 { font-size: 13pt; margin: 14pt 0 6pt; }
    p { margin: 0 0 10pt; text-indent: 2em; }
    blockquote { color: #4b5563; border-left: 3px solid #d1d5db; margin: 10pt 0; padding-left: 10pt; }
    ul { margin: 0 0 10pt 24pt; }
  </style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
}

function timestampForFilename(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function countExportWords(content: string) {
  const asciiWords = content.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkChars = content.match(/[\u3400-\u9FFF]/g)?.length ?? 0;
  return asciiWords + cjkChars;
}

async function buildProjectMarkdown(projectId: number, userId: number) {
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
  const chapterByNodeId = new Map<number, ExportChapter>(
    chapterRows.map((row) => [row.outlineNode.id, { ...row.chapter, outlineNode: row.outlineNode }]),
  );
  const orderedNodes = flattenOutlineTree(outlineTree);
  const leafNodeIds = new Set(orderedNodes.filter((node) => !node.children.length).map((node) => node.id));
  const sections = renderExportSections(project, planRows[0] ?? null, outlineTree, chapterByNodeId);
  const markdown = `${sections.join("\n\n---\n\n")}\n`;

  return {
    project,
    markdown,
    chapterCount: orderedNodes.filter((node) => leafNodeIds.has(node.id) && chapterByNodeId.has(node.id)).length,
  };
}

export async function exportProjectMarkdown(projectId: number, userId: number): Promise<ProjectExportResult | null> {
  const built = await buildProjectMarkdown(projectId, userId);
  if (!built) {
    return null;
  }

  const generatedAt = new Date();
  const filename = `book_${timestampForFilename(generatedAt)}.md`;
  const filePath = normalizeStorageKey("exports", projectId, filename);

  await putObject(filePath, built.markdown, "text/markdown; charset=utf-8");

  return {
    format: "markdown",
    filename,
    filePath,
    downloadUrl: `/api/projects/${projectId}/exports/${filename}`,
    wordCount: countExportWords(built.markdown),
    chapterCount: built.chapterCount,
    generatedAt: generatedAt.toISOString(),
  };
}

export async function exportProjectWord(projectId: number, userId: number): Promise<ProjectExportResult | null> {
  const built = await buildProjectMarkdown(projectId, userId);
  if (!built) {
    return null;
  }

  const generatedAt = new Date();
  const filename = `book_${timestampForFilename(generatedAt)}.doc`;
  const filePath = normalizeStorageKey("exports", projectId, filename);
  const wordHtml = renderWordDocument(built.markdown);

  await putObject(filePath, wordHtml, "application/msword; charset=utf-8");

  return {
    format: "word",
    filename,
    filePath,
    downloadUrl: `/api/projects/${projectId}/exports/${filename}`,
    wordCount: countExportWords(built.markdown),
    chapterCount: built.chapterCount,
    generatedAt: generatedAt.toISOString(),
  };
}

export async function getProjectExportFile(projectId: number, userId: number, filename: string) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  if (!/^book_[A-Za-z0-9]+\.(md|doc)$/.test(filename)) {
    return null;
  }

  const filePath = normalizeStorageKey("exports", projectId, filename);
  const content = await getObjectText(filePath);
  if (!content) {
    return null;
  }

  return {
    filename,
    content,
    contentType: filename.endsWith(".doc") ? "application/msword; charset=utf-8" : "text/markdown; charset=utf-8",
  };
}
