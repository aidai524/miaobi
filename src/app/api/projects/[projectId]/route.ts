import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteUserProject, getUserProject, updateUserProject } from "@/lib/projects/service";
import { updateProjectSchema } from "@/lib/projects/validation";
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

  const project = await getUserProject(id, user.id);
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(request: Request, context: RouteContext) {
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

    const input = updateProjectSchema.parse(await request.json().catch(() => null));
    const project = await updateUserProject(id, user.id, input);
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return errorResponse(error, "更新项目失败，请稍后重试");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const id = parseId(projectId);

  if (!id) {
    return NextResponse.json({ error: "项目 ID 无效" }, { status: 400 });
  }

  const deleted = await deleteUserProject(id, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
