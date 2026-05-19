import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { importPublicBooks } from "@/lib/public-library/service";
import { importPublicBooksSchema } from "@/lib/public-library/validation";
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

    const parsed = importPublicBooksSchema.parse(await request.json().catch(() => null));
    const inputs = Array.isArray(parsed) ? parsed : parsed.books;
    const books = await importPublicBooks(inputs);
    return NextResponse.json({ books, count: books.length }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "导入图书失败，请检查 JSON 格式");
  }
}
