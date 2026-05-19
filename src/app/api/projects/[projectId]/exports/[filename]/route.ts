import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getProjectExportFile } from "@/lib/export/markdown";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ projectId: string; filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { projectId, filename } = await context.params;
  const id = parseId(projectId);
  if (!id) {
    return NextResponse.json({ error: "项目 ID 无效" }, { status: 400 });
  }

  const file = await getProjectExportFile(id, user.id, filename);
  if (!file) {
    return NextResponse.json({ error: "导出文件不存在" }, { status: 404 });
  }

  return new NextResponse(file.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
