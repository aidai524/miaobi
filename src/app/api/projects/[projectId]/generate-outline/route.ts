import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { generateOutline } from "@/lib/ai/outline";
import type { BookPlanResult } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { bookProjects } from "@/lib/db/schema";
import { parseJsonArray } from "@/lib/format";
import { errorResponse, parseId } from "@/lib/http";
import { getUserModel, mapModelContext } from "@/lib/models/service";
import { buildOutlineTree, listProjectOutlineNodes, replaceProjectOutline } from "@/lib/outline/service";
import { getProjectPlan, getUserProject } from "@/lib/projects/service";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

function mapPlan(plan: NonNullable<Awaited<ReturnType<typeof getProjectPlan>>>): BookPlanResult {
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

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const id = parseId(projectId);
    if (!id) {
      return NextResponse.json({ error: "项目 ID 无效" }, { status: 400 });
    }

    const project = await getUserProject(id, user.id);
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    const plan = await getProjectPlan(id, user.id);
    if (!plan) {
      return NextResponse.json({ error: "请先生成图书策划案" }, { status: 409 });
    }

    const generated = await generateOutline({
      topic: project.topic,
      targetReader: project.targetReader,
      bookType: project.bookType,
      writingStyle: project.writingStyle,
      expectedWordCount: project.expectedWordCount,
      plan: mapPlan(plan),
      referenceModel: project.referenceModelId
        ? mapModelContext(await getUserModel(project.referenceModelId, user.id))
        : null,
    });

    await replaceProjectOutline(project.id, generated.data.nodes);
    await db
      .update(bookProjects)
      .set({
        status: "outlined",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookProjects.id, project.id));

    const nodes = await listProjectOutlineNodes(project.id, user.id);
    return NextResponse.json({ nodes, tree: buildOutlineTree(nodes ?? []) });
  } catch (error) {
    console.error("generate-outline failed", error);
    return errorResponse(error, "生成目录失败，请稍后重试");
  }
}
