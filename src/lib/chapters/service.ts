import { and, asc, desc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookProjects, chapterVersions, chapters, outlineNodes } from "@/lib/db/schema";
import { buildOutlineTree } from "@/lib/outline/service";
import { getUserProject } from "@/lib/projects/service";
import type { ChapterUpdateInput } from "./validation";

export type Chapter = typeof chapters.$inferSelect;
export type ChapterWithNode = Chapter & {
  outlineNode: typeof outlineNodes.$inferSelect;
};

export function countWords(content: string) {
  const asciiWords = content.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkChars = content.match(/[\u3400-\u9FFF]/g)?.length ?? 0;
  return asciiWords + cjkChars;
}

function getLeafNodeIds(nodes: Array<typeof outlineNodes.$inferSelect>) {
  const tree = buildOutlineTree(nodes);
  const ids = new Set<number>();

  function walk(items: typeof tree) {
    for (const item of items) {
      if (item.children.length) {
        walk(item.children);
      } else {
        ids.add(item.id);
      }
    }
  }

  walk(tree);
  return ids;
}

export async function ensureProjectChapters(projectId: number, userId: number) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const nodes = await db
    .select()
    .from(outlineNodes)
    .where(eq(outlineNodes.projectId, projectId))
    .orderBy(asc(outlineNodes.level), asc(outlineNodes.sortOrder), asc(outlineNodes.id));

  const leafNodeIds = getLeafNodeIds(nodes);
  const existing = await db.select().from(chapters).where(eq(chapters.projectId, projectId));
  const existingNodeIds = new Set(existing.map((chapter) => chapter.outlineNodeId));

  for (const node of nodes) {
    if (!leafNodeIds.has(node.id)) {
      continue;
    }

    if (existingNodeIds.has(node.id)) {
      continue;
    }

    await db.insert(chapters).values({
      projectId,
      outlineNodeId: node.id,
      title: node.title,
      content: "",
      status: "draft",
      wordCount: 0,
    });
  }

  return listProjectChapters(projectId, userId);
}

export async function listProjectChapters(projectId: number, userId: number) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const nodes = await db
    .select()
    .from(outlineNodes)
    .where(eq(outlineNodes.projectId, projectId))
    .orderBy(asc(outlineNodes.level), asc(outlineNodes.sortOrder), asc(outlineNodes.id));
  const leafNodeIds = getLeafNodeIds(nodes);

  const rows = await db
    .select({
      chapter: chapters,
      outlineNode: outlineNodes,
    })
    .from(chapters)
    .innerJoin(outlineNodes, eq(chapters.outlineNodeId, outlineNodes.id))
    .where(eq(chapters.projectId, projectId))
    .orderBy(asc(outlineNodes.level), asc(outlineNodes.sortOrder), asc(outlineNodes.id));

  return rows
    .filter((row) => leafNodeIds.has(row.outlineNode.id))
    .map((row) => ({
      ...row.chapter,
      outlineNode: row.outlineNode,
    }));
}

export async function getUserChapter(chapterId: number, userId: number): Promise<ChapterWithNode | null> {
  const rows = await db
    .select({
      chapter: chapters,
      outlineNode: outlineNodes,
      projectUserId: bookProjects.userId,
    })
    .from(chapters)
    .innerJoin(bookProjects, eq(chapters.projectId, bookProjects.id))
    .innerJoin(outlineNodes, eq(chapters.outlineNodeId, outlineNodes.id))
    .where(and(eq(chapters.id, chapterId), eq(bookProjects.userId, userId)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  const childRows = await db
    .select({ id: outlineNodes.id })
    .from(outlineNodes)
    .where(and(eq(outlineNodes.projectId, row.chapter.projectId), eq(outlineNodes.parentId, row.outlineNode.id)))
    .limit(1);
  if (childRows.length) {
    return null;
  }

  return {
    ...row.chapter,
    outlineNode: row.outlineNode,
  };
}

async function getNextVersionNo(chapterId: number) {
  const rows = await db
    .select({ value: max(chapterVersions.versionNo) })
    .from(chapterVersions)
    .where(eq(chapterVersions.chapterId, chapterId));

  return (rows[0]?.value ?? 0) + 1;
}

export async function createChapterVersion(chapterId: number, content: string, createdBy: string) {
  const rows = await db
    .insert(chapterVersions)
    .values({
      chapterId,
      versionNo: await getNextVersionNo(chapterId),
      content,
      createdBy,
    })
    .returning();

  return rows[0];
}

export async function updateChapter(chapterId: number, userId: number, input: ChapterUpdateInput) {
  const current = await getUserChapter(chapterId, userId);
  if (!current) {
    return null;
  }

  const content = input.content ?? current.content ?? "";
  const rows = await db
    .update(chapters)
    .set({
      title: input.title ?? current.title,
      content,
      status: content.trim() ? "draft" : current.status,
      wordCount: countWords(content),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(chapters.id, chapterId))
    .returning();

  if (input.createVersion) {
    await createChapterVersion(chapterId, content, "user");
  }

  return rows[0] ?? null;
}

export async function setChapterContent(chapterId: number, userId: number, content: string, createdBy: string) {
  const current = await getUserChapter(chapterId, userId);
  if (!current) {
    return null;
  }

  const rows = await db
    .update(chapters)
    .set({
      content,
      status: "draft",
      wordCount: countWords(content),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(chapters.id, chapterId))
    .returning();

  await createChapterVersion(chapterId, content, createdBy);
  return rows[0] ?? null;
}

export async function listChapterVersions(chapterId: number, userId: number) {
  const chapter = await getUserChapter(chapterId, userId);
  if (!chapter) {
    return null;
  }

  return db
    .select()
    .from(chapterVersions)
    .where(eq(chapterVersions.chapterId, chapterId))
    .orderBy(desc(chapterVersions.versionNo));
}

export async function restoreChapterVersion(chapterId: number, userId: number, versionId: number) {
  const chapter = await getUserChapter(chapterId, userId);
  if (!chapter) {
    return null;
  }

  const rows = await db
    .select()
    .from(chapterVersions)
    .where(and(eq(chapterVersions.id, versionId), eq(chapterVersions.chapterId, chapterId)))
    .limit(1);
  const version = rows[0];

  if (!version) {
    return null;
  }

  return setChapterContent(chapterId, userId, version.content, "restore");
}
