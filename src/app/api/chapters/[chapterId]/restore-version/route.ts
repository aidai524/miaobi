import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { restoreChapterVersion } from "@/lib/chapters/service";
import { restoreVersionSchema } from "@/lib/chapters/validation";
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

    const input = restoreVersionSchema.parse(await request.json().catch(() => null));
    const chapter = await restoreChapterVersion(id, user.id, input.versionId);
    if (!chapter) {
      return NextResponse.json({ error: "章节或版本不存在" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    return errorResponse(error, "恢复版本失败，请稍后重试");
  }
}
