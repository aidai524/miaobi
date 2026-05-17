import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { generateBookPlan } from "@/lib/ai/book-plan";
import { db } from "@/lib/db";
import { bookPlans, bookProjects } from "@/lib/db/schema";
import { errorResponse, parseId } from "@/lib/http";
import { getUserProject } from "@/lib/projects/service";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

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

    const generated = await generateBookPlan({
      topic: project.topic,
      targetReader: project.targetReader,
      bookType: project.bookType,
      writingStyle: project.writingStyle,
      expectedWordCount: project.expectedWordCount,
    });

    await db.delete(bookPlans).where(eq(bookPlans.projectId, project.id));
    const rows = await db
      .insert(bookPlans)
      .values({
        projectId: project.id,
        positioning: generated.data.positioning,
        targetReaderAnalysis: generated.data.targetReaderAnalysis,
        marketAngle: generated.data.marketAngle,
        corePromise: generated.data.corePromise,
        titleSuggestions: JSON.stringify(generated.data.titleSuggestions),
        subtitleSuggestions: JSON.stringify(generated.data.subtitleSuggestions),
        sellingPoints: JSON.stringify(generated.data.sellingPoints),
        structureSuggestion: generated.data.structureSuggestion,
        risks: JSON.stringify(generated.data.risks),
        editorialAdvice: generated.data.editorialAdvice,
        aiRawOutput: generated.raw,
      })
      .returning();

    await db
      .update(bookProjects)
      .set({
        title: generated.data.titleSuggestions[0] || project.title || project.topic,
        status: "planning",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookProjects.id, project.id));

    return NextResponse.json({ plan: rows[0] });
  } catch (error) {
    return errorResponse(error, "生成策划案失败，请稍后重试");
  }
}
