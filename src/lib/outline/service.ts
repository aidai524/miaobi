import { and, asc, eq, inArray, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookProjects, outlineNodes } from "@/lib/db/schema";
import type { AppDb, AppDbTransaction } from "@/lib/db/types";
import type { OutlineNodeResult } from "@/lib/ai/types";
import { getUserProject } from "@/lib/projects/service";
import { isCloudflareRuntime } from "@/lib/runtime";
import type { OutlineNodeInput, OutlineNodeUpdateInput } from "./validation";

export type OutlineNode = typeof outlineNodes.$inferSelect;

export type OutlineTreeNode = OutlineNode & {
  children: OutlineTreeNode[];
};

export async function listProjectOutlineNodes(projectId: number, userId: number) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  return db
    .select()
    .from(outlineNodes)
    .where(eq(outlineNodes.projectId, projectId))
    .orderBy(asc(outlineNodes.level), asc(outlineNodes.sortOrder), asc(outlineNodes.id));
}

export function buildOutlineTree(nodes: OutlineNode[]): OutlineTreeNode[] {
  const nodeMap = new Map<number, OutlineTreeNode>();
  const roots: OutlineTreeNode[] = [];

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (items: OutlineTreeNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    items.forEach((item) => sortTree(item.children));
  };

  sortTree(roots);
  return roots;
}

async function getNextSortOrder(projectId: number, parentId: number | null) {
  const rows = await db
    .select({ value: max(outlineNodes.sortOrder) })
    .from(outlineNodes)
    .where(
      parentId
        ? and(eq(outlineNodes.projectId, projectId), eq(outlineNodes.parentId, parentId))
        : and(eq(outlineNodes.projectId, projectId), eq(outlineNodes.level, 1)),
    );

  return (rows[0]?.value ?? 0) + 1;
}

async function getParentNode(projectId: number, parentId: number | null | undefined) {
  if (!parentId) {
    return null;
  }

  const rows = await db
    .select()
    .from(outlineNodes)
    .where(and(eq(outlineNodes.id, parentId), eq(outlineNodes.projectId, projectId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createOutlineNode(projectId: number, userId: number, input: OutlineNodeInput) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const parent = await getParentNode(projectId, input.parentId);
  const level = parent ? Math.min(parent.level + 1, 3) : 1;
  const parentId = parent?.id ?? null;

  const rows = await db
    .insert(outlineNodes)
    .values({
      projectId,
      parentId,
      level,
      sortOrder: await getNextSortOrder(projectId, parentId),
      title: input.title,
      summary: input.summary,
      writingGoal: input.writingGoal,
      suggestedWordCount: input.suggestedWordCount,
    })
    .returning();

  return rows[0] ?? null;
}

export async function updateOutlineNode(nodeId: number, userId: number, input: OutlineNodeUpdateInput) {
  const rows = await db
    .select({
      node: outlineNodes,
      projectUserId: bookProjects.userId,
    })
    .from(outlineNodes)
    .innerJoin(bookProjects, eq(outlineNodes.projectId, bookProjects.id))
    .where(and(eq(outlineNodes.id, nodeId), eq(bookProjects.userId, userId)))
    .limit(1);

  const current = rows[0]?.node;
  if (!current) {
    return null;
  }

  let parentId = current.parentId;
  let level = current.level;

  if ("parentId" in input) {
    const parent = await getParentNode(current.projectId, input.parentId);
    parentId = parent?.id ?? null;
    level = parent ? Math.min(parent.level + 1, 3) : 1;
  }

  const updated = await db
    .update(outlineNodes)
    .set({
      parentId,
      level,
      title: input.title ?? current.title,
      summary: input.summary ?? current.summary,
      writingGoal: input.writingGoal ?? current.writingGoal,
      suggestedWordCount:
        "suggestedWordCount" in input ? input.suggestedWordCount : current.suggestedWordCount,
      sortOrder: input.sortOrder ?? current.sortOrder,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(outlineNodes.id, nodeId))
    .returning();

  return updated[0] ?? null;
}

export async function deleteOutlineNode(nodeId: number, userId: number) {
  const rows = await db
    .select({
      node: outlineNodes,
      projectUserId: bookProjects.userId,
    })
    .from(outlineNodes)
    .innerJoin(bookProjects, eq(outlineNodes.projectId, bookProjects.id))
    .where(and(eq(outlineNodes.id, nodeId), eq(bookProjects.userId, userId)))
    .limit(1);

  const node = rows[0]?.node;
  if (!node) {
    return false;
  }

  const allNodes = await db.select().from(outlineNodes).where(eq(outlineNodes.projectId, node.projectId));
  const ids = collectDescendantIds(allNodes, node.id);
  await db.delete(outlineNodes).where(inArray(outlineNodes.id, ids));
  return true;
}

function collectDescendantIds(nodes: OutlineNode[], rootId: number) {
  const ids = new Set<number>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (node.parentId && ids.has(node.parentId) && !ids.has(node.id)) {
        ids.add(node.id);
        changed = true;
      }
    }
  }

  return [...ids];
}

async function insertOutlineNodes(
  tx: AppDb | AppDbTransaction,
  projectId: number,
  items: OutlineNodeResult[],
  parentId: number | null,
  level: number,
) {
  for (const [index, item] of items.entries()) {
    const rows = await tx
      .insert(outlineNodes)
      .values({
        projectId,
        parentId,
        level,
        sortOrder: index + 1,
        title: item.title,
        summary: item.summary,
        writingGoal: item.writingGoal,
        suggestedWordCount: item.suggestedWordCount ?? null,
      })
      .returning();

    const inserted = rows[0];
    if (inserted && item.children?.length && level < 3) {
      await insertOutlineNodes(tx, projectId, item.children, inserted.id, level + 1);
    }
  }
}

export async function replaceProjectOutline(projectId: number, nodes: OutlineNodeResult[]) {
  if (isCloudflareRuntime()) {
    await db.delete(outlineNodes).where(eq(outlineNodes.projectId, projectId));
    await insertOutlineNodes(db, projectId, nodes, null, 1);
    return;
  }

  await db.transaction(async (tx) => {
    await tx.delete(outlineNodes).where(eq(outlineNodes.projectId, projectId));
    await insertOutlineNodes(tx, projectId, nodes, null, 1);
  });
}
