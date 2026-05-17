import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { errorResponse, parseId } from "@/lib/http";
import { deleteOutlineNode, updateOutlineNode } from "@/lib/outline/service";
import { outlineNodeUpdateSchema } from "@/lib/outline/validation";

type RouteContext = {
  params: Promise<{ nodeId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { nodeId } = await context.params;
    const id = parseId(nodeId);
    if (!id) {
      return NextResponse.json({ error: "目录节点 ID 无效" }, { status: 400 });
    }

    const input = outlineNodeUpdateSchema.parse(await request.json().catch(() => null));
    const node = await updateOutlineNode(id, user.id, input);
    if (!node) {
      return NextResponse.json({ error: "目录节点不存在" }, { status: 404 });
    }

    return NextResponse.json({ node });
  } catch (error) {
    return errorResponse(error, "保存目录节点失败，请稍后重试");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { nodeId } = await context.params;
  const id = parseId(nodeId);
  if (!id) {
    return NextResponse.json({ error: "目录节点 ID 无效" }, { status: 400 });
  }

  const deleted = await deleteOutlineNode(id, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "目录节点不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
