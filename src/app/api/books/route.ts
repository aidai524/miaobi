import { NextResponse } from "next/server";
import { listPublicBooks } from "@/lib/public-library/service";
import { publicBookQuerySchema } from "@/lib/public-library/validation";
import { errorResponse } from "@/lib/http";

export async function GET(request: Request) {
  try {
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
