import { NextResponse } from "next/server";
import { getPublicBook } from "@/lib/public-library/service";
import { parseId } from "@/lib/http";

type RouteContext = {
  params: Promise<{ bookId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { bookId } = await context.params;
  const id = parseId(bookId);
  if (!id) {
    return NextResponse.json({ error: "图书 ID 无效" }, { status: 400 });
  }

  const book = await getPublicBook(id);
  if (!book) {
    return NextResponse.json({ error: "图书不存在" }, { status: 404 });
  }

  return NextResponse.json(book);
}
