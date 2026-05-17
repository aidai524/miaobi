import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createDocumentRecord } from "@/lib/analysis/service";
import { saveUploadedFile } from "@/lib/files/upload";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const saved = await saveUploadedFile(user.id, file);
    const document = await createDocumentRecord({
      userId: user.id,
      ...saved,
      status: saved.extractedText.trim() ? "extracted" : "parse_failed",
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传成功，但文本解析失败" },
      { status: 400 },
    );
  }
}
