import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserAnalysis } from "@/lib/analysis/service";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ analysisId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { analysisId } = await context.params;
  const id = parseId(analysisId);
  if (!id) {
    return NextResponse.json({ error: "分析 ID 无效" }, { status: 400 });
  }

  const result = await getUserAnalysis(id, user.id);
  if (!result) {
    return NextResponse.json({ error: "分析不存在" }, { status: 404 });
  }

  return NextResponse.json(result);
}
