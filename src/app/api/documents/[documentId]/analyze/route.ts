import { NextResponse } from "next/server";
import { analyzeText } from "@/lib/ai/analysis";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createTextAnalysis,
  getUserDocument,
  markDocumentStatus,
} from "@/lib/analysis/service";
import { analyzeDocumentSchema } from "@/lib/analysis/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { documentId } = await context.params;
    const id = parseId(documentId);
    if (!id) {
      return NextResponse.json({ error: "文档 ID 无效" }, { status: 400 });
    }

    const input = analyzeDocumentSchema.parse(await request.json().catch(() => ({})));
    const document = await getUserDocument(id, user.id);
    if (!document) {
      return NextResponse.json({ error: "文档不存在" }, { status: 404 });
    }

    if (!document.extractedText?.trim()) {
      return NextResponse.json({ error: "文档没有可分析文本" }, { status: 409 });
    }

    await markDocumentStatus(document.id, user.id, "analyzing");
    const result = await analyzeText({
      text: document.extractedText,
      analysisType: input.analysisType,
    });

    const analysis = await createTextAnalysis({
      userId: user.id,
      documentId: document.id,
      analysisType: input.analysisType,
      result: result.data,
      raw: result.raw,
    });
    await markDocumentStatus(document.id, user.id, "analyzed");

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "AI 分析未完成，请重新发起");
  }
}
