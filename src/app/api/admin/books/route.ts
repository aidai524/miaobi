import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPublicBook, listPublicBooks } from "@/lib/public-library/service";
import { publicBookQuerySchema, upsertPublicBookSchema } from "@/lib/public-library/validation";
import { errorResponse } from "@/lib/http";

function forbidden() {
  return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return forbidden();
    }

    const searchParams = new URL(request.url).searchParams;
    const query = publicBookQuerySchema.parse({
      q: searchParams.get("q") || undefined,
      author: searchParams.get("author") || undefined,
      category: searchParams.get("category") || undefined,
    });
    const books = await listPublicBooks(query);
    return NextResponse.json({ books });
  } catch (error) {
    return errorResponse(error, "读取图书库失败，请稍后重试");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return forbidden();
    }

    const input = upsertPublicBookSchema.parse(await request.json().catch(() => null));
    const book = await createPublicBook(input);
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "新增图书失败，请稍后重试");
  }
}
