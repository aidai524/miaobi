import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPublicAuthor, listPublicAuthors } from "@/lib/public-library/service";
import {
  publicAuthorQuerySchema,
  upsertPublicAuthorSchema,
} from "@/lib/public-library/validation";
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
    const query = publicAuthorQuerySchema.parse({
      q: searchParams.get("q") || undefined,
      field: searchParams.get("field") || undefined,
    });
    const authors = await listPublicAuthors(query);
    return NextResponse.json({ authors });
  } catch (error) {
    return errorResponse(error, "读取作者库失败，请稍后重试");
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

    const input = upsertPublicAuthorSchema.parse(await request.json().catch(() => null));
    const author = await createPublicAuthor(input);
    return NextResponse.json({ author }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "新增作者失败，请稍后重试");
  }
}
