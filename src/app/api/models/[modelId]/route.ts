import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteUserModel, getUserModel, updateUserModel } from "@/lib/models/service";
import { updateModelSchema } from "@/lib/models/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ modelId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { modelId } = await context.params;
  const id = parseId(modelId);
  if (!id) {
    return NextResponse.json({ error: "模型 ID 无效" }, { status: 400 });
  }

  const model = await getUserModel(id, user.id);
  if (!model) {
    return NextResponse.json({ error: "模型不存在" }, { status: 404 });
  }

  return NextResponse.json({ model });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { modelId } = await context.params;
    const id = parseId(modelId);
    if (!id) {
      return NextResponse.json({ error: "模型 ID 无效" }, { status: 400 });
    }

    const input = updateModelSchema.parse(await request.json().catch(() => null));
    const model = await updateUserModel(id, user.id, input);
    if (!model) {
      return NextResponse.json({ error: "模型不存在" }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error) {
    return errorResponse(error, "更新创作模型失败，请稍后重试");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { modelId } = await context.params;
  const id = parseId(modelId);
  if (!id) {
    return NextResponse.json({ error: "模型 ID 无效" }, { status: 400 });
  }

  const deleted = await deleteUserModel(id, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "模型不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
