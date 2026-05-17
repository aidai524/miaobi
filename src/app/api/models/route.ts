import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserModels } from "@/lib/models/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const models = await listUserModels(user.id);
  return NextResponse.json({ models });
}
