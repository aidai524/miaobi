import { NextResponse } from "next/server";
import { generateChapter, generateChapterStream } from "@/lib/ai/chapter";
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
    const leafNodes = flatNodes.filter((node) => !node.children.length);
    const currentIndex = flatNodes.findIndex((node) => node.id === chapter.outlineNodeId);
    const currentNode = flatNodes[currentIndex] ?? chapter.outlineNode;
    const leafIndex = leafNodes.findIndex((node) => node.id === chapter.outlineNodeId);
    if (leafIndex < 0) {
      return NextResponse.json({ error: "请选择最末级章节生成正文" }, { status: 409 });
    }
    const plan = await getProjectPlan(project.id, user.id);
    const averageWordCount =
      project.expectedWordCount && leafNodes.length ? Math.round(project.expectedWordCount / leafNodes.length) : null;
    const targetWordCount =
      currentNode.suggestedWordCount && averageWordCount
        ? Math.max(currentNode.suggestedWordCount, averageWordCount)
        : (currentNode.suggestedWordCount ?? averageWordCount);

    const input = {
      topic: project.topic,
      targetReader: project.targetReader,
      bookType: project.bookType,
      writingStyle: project.writingStyle,
      expectedWordCount: project.expectedWordCount,
      plan: plan ? mapBookPlan(plan) : null,
      currentNode: toChapterContextNode(currentNode),
      previousNode: leafNodes[leafIndex - 1] ? toChapterContextNode(leafNodes[leafIndex - 1]) : null,
      nextNode: leafNodes[leafIndex + 1] ? toChapterContextNode(leafNodes[leafIndex + 1]) : null,
      targetWordCount,
    };

    if (_request.headers.get("accept")?.includes("text/event-stream")) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let content = "";

          function send(event: string, data: unknown) {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          }

          try {
            for await (const chunk of generateChapterStream(input)) {
              content += chunk;
              send("chunk", { content: chunk });
            }

            if (!content.trim()) {
              throw new Error("AI 返回内容为空");
            }

            const updated = await setChapterContent(id, user.id, content, "ai");
            send("done", { chapter: updated });
            controller.close();
          } catch (streamError) {
            send("error", {
              error: streamError instanceof Error ? streamError.message : "生成正文失败，请稍后重试",
            });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const content = await generateChapter(input);

    const updated = await setChapterContent(id, user.id, content, "ai");
    return NextResponse.json({ chapter: updated });
  } catch (error) {
    return errorResponse(error, "生成正文失败，请稍后重试");
  }
}
