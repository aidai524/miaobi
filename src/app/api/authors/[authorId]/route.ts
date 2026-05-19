import { NextResponse } from "next/server";
import { getPublicAuthor } from "@/lib/public-library/service";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ authorId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { authorId } = await context.params;
  const id = parseId(authorId);
  if (!id) {
    return NextResponse.json({ error: "作者 ID 无效" }, { status: 400 });
  }

  const author = await getPublicAuthor(id);
  if (!author) {
    return NextResponse.json({ error: "作者不存在" }, { status: 404 });
  }

  return NextResponse.json({ author });
}
