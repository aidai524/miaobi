import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const nickname = process.env.ADMIN_NICKNAME?.trim() || "管理员";

  if (!email || !password) {
    throw new Error("请先设置 ADMIN_EMAIL 和 ADMIN_PASSWORD 后再执行 npm run db:seed");
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const passwordHash = await hashPassword(password);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        passwordHash,
        nickname,
        role: "admin",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, existing[0].id));
    console.log(`管理员账号已更新: ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    passwordHash,
    nickname,
    role: "admin",
  });
  console.log(`管理员账号已创建: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
