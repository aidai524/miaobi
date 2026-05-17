import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureProjectChapters } from "@/lib/chapters/service";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const id = parseId(projectId);
  if (!id) {
    return NextResponse.json({ error: "项目 ID 无效" }, { status: 400 });
  }

  const chapters = await ensureProjectChapters(id, user.id);
  if (!chapters) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  return NextResponse.json({ chapters });
}
