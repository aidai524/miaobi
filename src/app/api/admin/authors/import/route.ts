import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { importPublicAuthors } from "@/lib/public-library/service";
import { importPublicAuthorsSchema } from "@/lib/public-library/validation";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const parsed = importPublicAuthorsSchema.parse(await request.json().catch(() => null));
    const inputs = Array.isArray(parsed) ? parsed : parsed.authors;
    const authors = await importPublicAuthors(inputs);
    return NextResponse.json({ authors, count: authors.length }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "导入作者失败，请检查 JSON 格式");
  }
}
