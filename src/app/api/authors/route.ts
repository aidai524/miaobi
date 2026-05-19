import { NextResponse } from "next/server";
import { listPublicAuthors } from "@/lib/public-library/service";
import { publicAuthorQuerySchema } from "@/lib/public-library/validation";
import { errorResponse } from "@/lib/http";

export async function GET(request: Request) {
  try {
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
