import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listChapterVersions } from "@/lib/chapters/service";
import { parseId } from "@/lib/http";

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

  const versions = await listChapterVersions(id, user.id);
  if (!versions) {
    return NextResponse.json({ error: "章节不存在" }, { status: 404 });
  }

  return NextResponse.json({ versions });
}
