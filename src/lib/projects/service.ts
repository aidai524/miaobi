import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookPlans, bookProjects } from "@/lib/db/schema";
import { getUserModel } from "@/lib/models/service";
import type { CreateProjectInput, UpdateProjectInput } from "./validation";

export async function listUserProjects(userId: number) {
  return db
    .select()
    .from(bookProjects)
    .where(eq(bookProjects.userId, userId))
    .orderBy(desc(bookProjects.updatedAt));
}

export async function getUserProject(projectId: number, userId: number) {
  const rows = await db
    .select()
    .from(bookProjects)
    .where(and(eq(bookProjects.id, projectId), eq(bookProjects.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createUserProject(userId: number, input: CreateProjectInput) {
  const referenceModel = input.referenceModelId ? await getUserModel(input.referenceModelId, userId) : null;

  const rows = await db
    .insert(bookProjects)
    .values({
      userId,
      title: input.topic,
      topic: input.topic,
      targetReader: input.targetReader,
      bookType: input.bookType,
      writingStyle: input.writingStyle,
      expectedWordCount: input.expectedWordCount,
      referenceModelId: referenceModel?.id,
      status: "draft",
    })
    .returning();

  return rows[0];
}

export async function updateUserProject(projectId: number, userId: number, input: UpdateProjectInput) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const rows = await db
    .update(bookProjects)
    .set({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(bookProjects.id, projectId), eq(bookProjects.userId, userId)))
    .returning();

  return rows[0] ?? null;
}

export async function deleteUserProject(projectId: number, userId: number) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return false;
  }

  await db.delete(bookProjects).where(and(eq(bookProjects.id, projectId), eq(bookProjects.userId, userId)));
  return true;
}

export async function getProjectPlan(projectId: number, userId: number) {
  const project = await getUserProject(projectId, userId);
  if (!project) {
    return null;
  }

  const rows = await db.select().from(bookPlans).where(eq(bookPlans.projectId, projectId)).limit(1);
  return rows[0] ?? null;
}
