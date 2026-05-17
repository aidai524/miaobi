import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildOutlineTree, createOutlineNode, listProjectOutlineNodes } from "@/lib/outline/service";
import { outlineNodeInputSchema } from "@/lib/outline/validation";
import { errorResponse, parseId } from "@/lib/http";

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

  const nodes = await listProjectOutlineNodes(id, user.id);
  if (!nodes) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  return NextResponse.json({ nodes, tree: buildOutlineTree(nodes) });
}

export async function POST(request: Request, context: RouteContext) {
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

    const input = outlineNodeInputSchema.parse(await request.json().catch(() => null));
    const node = await createOutlineNode(id, user.id, input);
    if (!node) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json({ node }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "新增目录节点失败，请稍后重试");
  }
}
