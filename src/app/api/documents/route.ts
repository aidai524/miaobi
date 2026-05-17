import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserDocuments } from "@/lib/analysis/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const documents = await listUserDocuments(user.id);
  return NextResponse.json({ documents });
}
