import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { authSessions, users, type User } from "@/lib/db/schema";

const SESSION_DAYS = 30;

export type CurrentUser = Pick<User, "id" | "email" | "nickname" | "role">;

function toHex(bytes: Uint8Array | ArrayBuffer) {
  const values = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(values, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(digest);
}

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function createSession(userId: number) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(authSessions).values({
    userId,
    tokenHash: await hashToken(token),
    expiresAt: expiresAt.toISOString(),
  });

  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function deleteRequestSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return;
  }

  await db.delete(authSessions).where(eq(authSessions.tokenHash, await hashToken(token)));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const now = new Date().toISOString();
  const rows = await db
    .select({
      sessionId: authSessions.id,
      userId: users.id,
      email: users.email,
      nickname: users.nickname,
      role: users.role,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, await hashToken(token)), gt(authSessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.userId,
    email: row.email,
    nickname: row.nickname,
    role: row.role,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}
