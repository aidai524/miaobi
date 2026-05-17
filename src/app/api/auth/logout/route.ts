import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, deleteRequestSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await deleteRequestSession(request);
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
