import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deletePublicBook, updatePublicBook } from "@/lib/public-library/service";
import { upsertPublicBookSchema } from "@/lib/public-library/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ bookId: string }>;
};

function forbidden() {
  return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
}

async function requireApiAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { response: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { response: forbidden() };
  }
  return { user };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireApiAdmin();
    if ("response" in auth) {
      return auth.response;
    }

    const { bookId } = await context.params;
    const id = parseId(bookId);
    if (!id) {
      return NextResponse.json({ error: "图书 ID 无效" }, { status: 400 });
    }

    const input = upsertPublicBookSchema.parse(await request.json().catch(() => null));
    const book = await updatePublicBook(id, input);
    if (!book) {
      return NextResponse.json({ error: "图书不存在" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "更新图书失败，请稍后重试");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireApiAdmin();
    if ("response" in auth) {
      return auth.response;
    }

    const { bookId } = await context.params;
    const id = parseId(bookId);
    if (!id) {
      return NextResponse.json({ error: "图书 ID 无效" }, { status: 400 });
    }

    const deleted = await deletePublicBook(id);
    if (!deleted) {
      return NextResponse.json({ error: "图书不存在" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "删除图书失败，请稍后重试");
  }
}
