import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserModel } from "@/lib/models/service";
import { createProjectFromModelSchema } from "@/lib/models/validation";
import { createUserProject } from "@/lib/projects/service";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ modelId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

    const model = await getUserModel(id, user.id);
    if (!model) {
      return NextResponse.json({ error: "模型不存在" }, { status: 404 });
    }

    const input = createProjectFromModelSchema.parse(await request.json().catch(() => null));
    const project = await createUserProject(user.id, {
      topic: input.topic,
      targetReader: input.targetReader,
      bookType: input.bookType,
      writingStyle: input.writingStyle,
      expectedWordCount: input.expectedWordCount,
      referenceModelId: model.id,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "基于模型创建新书失败，请稍后重试");
  }
}
