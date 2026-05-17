import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserChapter, updateChapter } from "@/lib/chapters/service";
import { chapterUpdateSchema } from "@/lib/chapters/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ chapterId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  return NextResponse.json({ chapter });
}

export async function PATCH(request: Request, context: RouteContext) {
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

    const input = chapterUpdateSchema.parse(await request.json().catch(() => null));
    const chapter = await updateChapter(id, user.id, input);
    if (!chapter) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    return errorResponse(error, "保存正文失败，请稍后重试");
  }
}
