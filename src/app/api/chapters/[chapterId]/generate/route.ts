import { NextResponse } from "next/server";
import { generateChapter } from "@/lib/ai/chapter";
import { getCurrentUser } from "@/lib/auth/session";
import { flattenOutlineTree, mapBookPlan, toChapterContextNode } from "@/lib/chapters/context";
import { getUserChapter, setChapterContent } from "@/lib/chapters/service";
import { buildOutlineTree, listProjectOutlineNodes } from "@/lib/outline/service";
import { getProjectPlan, getUserProject } from "@/lib/projects/service";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ chapterId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { chapterId } = await context.params;
    const id = parseId(chapterId);
    if (!id) {
      return NextResponse.json({ error: "章节 ID 无效" }, { status: 400 });
    }

    const chapter = await getUserChapter(id, user.id);
    if (!chapter) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    const project = await getUserProject(chapter.projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    const nodes = (await listProjectOutlineNodes(project.id, user.id)) ?? [];
    const flatNodes = flattenOutlineTree(buildOutlineTree(nodes));
    const currentIndex = flatNodes.findIndex((node) => node.id === chapter.outlineNodeId);
    const currentNode = flatNodes[currentIndex] ?? chapter.outlineNode;
    const plan = await getProjectPlan(project.id, user.id);

    const content = await generateChapter({
      topic: project.topic,
      targetReader: project.targetReader,
      bookType: project.bookType,
      writingStyle: project.writingStyle,
      expectedWordCount: project.expectedWordCount,
      plan: plan ? mapBookPlan(plan) : null,
      currentNode: toChapterContextNode(currentNode),
      previousNode: flatNodes[currentIndex - 1] ? toChapterContextNode(flatNodes[currentIndex - 1]) : null,
      nextNode: flatNodes[currentIndex + 1] ? toChapterContextNode(flatNodes[currentIndex + 1]) : null,
    });

    const updated = await setChapterContent(id, user.id, content, "ai");
    return NextResponse.json({ chapter: updated });
  } catch (error) {
    return errorResponse(error, "生成正文失败，请稍后重试");
  }
}
