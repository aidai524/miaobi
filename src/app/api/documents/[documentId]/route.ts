import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserDocument } from "@/lib/analysis/service";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { documentId } = await context.params;
  const id = parseId(documentId);
  if (!id) {
    return NextResponse.json({ error: "文档 ID 无效" }, { status: 400 });
  }

  const document = await getUserDocument(id, user.id);
  if (!document) {
    return NextResponse.json({ error: "文档不存在" }, { status: 404 });
  }

  return NextResponse.json({ document });
}
