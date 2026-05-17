import { NextResponse } from "next/server";
import { createWritingModel } from "@/lib/ai/model";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createModelFromResult,
  getAnalysisForModel,
  mapAnalysisToResult,
} from "@/lib/models/service";
import { saveModelSchema } from "@/lib/models/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ analysisId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { analysisId } = await context.params;
    const id = parseId(analysisId);
    if (!id) {
      return NextResponse.json({ error: "分析 ID 无效" }, { status: 400 });
    }

    const input = saveModelSchema.parse(await request.json().catch(() => ({})));
    const analysis = await getAnalysisForModel(id, user.id);
    if (!analysis) {
      return NextResponse.json({ error: "分析不存在" }, { status: 404 });
    }

    const generated = await createWritingModel({
      name: input.name,
      analysis: mapAnalysisToResult(analysis),
    });

    const model = await createModelFromResult({
      userId: user.id,
      analysisId: analysis.id,
      sourceType: "analysis",
      result: generated.data,
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "保存创作模型失败，请稍后重试");
  }
}
