import { NextResponse } from "next/server";
import { rewriteChapter } from "@/lib/ai/chapter";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserChapter, setChapterContent } from "@/lib/chapters/service";
import { chapterRewriteSchema } from "@/lib/chapters/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ chapterId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

    const input = chapterRewriteSchema.parse(await request.json().catch(() => null));
    const chapter = await getUserChapter(id, user.id);
    if (!chapter) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    if (!chapter.content?.trim()) {
      return NextResponse.json({ error: "请先生成或填写正文" }, { status: 409 });
    }

    const content = await rewriteChapter({
      action: input.action,
      title: chapter.title,
      content: chapter.content,
    });

    const updated = await setChapterContent(id, user.id, content, `rewrite:${input.action}`);
    return NextResponse.json({ chapter: updated });
  } catch (error) {
    return errorResponse(error, "改写正文失败，请稍后重试");
  }
}
