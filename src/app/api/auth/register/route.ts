import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "提交内容无效" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists[0]) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash: await hashPassword(parsed.data.password),
      nickname: parsed.data.nickname,
      role: "user",
    })
    .returning({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      role: users.role,
    });

  const user = inserted[0];
  const session = await createSession(user.id);
  const response = NextResponse.json({ user }, { status: 201 });
  setSessionCookie(response, session.token, session.expiresAt);
  return response;
}
