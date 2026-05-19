import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deletePublicAuthor, updatePublicAuthor } from "@/lib/public-library/service";
import { upsertPublicAuthorSchema } from "@/lib/public-library/validation";
import { errorResponse, parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ authorId: string }>;
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

    const { authorId } = await context.params;
    const id = parseId(authorId);
    if (!id) {
      return NextResponse.json({ error: "作者 ID 无效" }, { status: 400 });
    }

    const input = upsertPublicAuthorSchema.parse(await request.json().catch(() => null));
    const author = await updatePublicAuthor(id, input);
    if (!author) {
      return NextResponse.json({ error: "作者不存在" }, { status: 404 });
    }

    return NextResponse.json({ author });
  } catch (error) {
    return errorResponse(error, "更新作者失败，请稍后重试");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireApiAdmin();
    if ("response" in auth) {
      return auth.response;
    }

    const { authorId } = await context.params;
    const id = parseId(authorId);
    if (!id) {
      return NextResponse.json({ error: "作者 ID 无效" }, { status: 400 });
    }

    const deleted = await deletePublicAuthor(id);
    if (!deleted) {
      return NextResponse.json({ error: "作者不存在" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "删除作者失败，请稍后重试");
  }
}
