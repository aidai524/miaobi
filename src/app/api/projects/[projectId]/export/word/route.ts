import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { exportProjectWord } from "@/lib/export/markdown";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    const exported = await exportProjectWord(id, user.id);
    if (!exported) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json({ export: exported });
  } catch (error) {
    return errorResponse(error, "导出 Word 失败，请稍后重试");
  }
}
