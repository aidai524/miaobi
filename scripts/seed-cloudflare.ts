import { spawn } from "node:child_process";
import { hashPassword } from "../src/lib/auth/password";

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const nickname = process.env.ADMIN_NICKNAME?.trim() || "管理员";
  const remote = process.argv.includes("--remote");

  if (!email || !password) {
    throw new Error("请先设置 ADMIN_EMAIL 和 ADMIN_PASSWORD 后再执行 Cloudflare seed");
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  const sql = `
INSERT INTO users (email, password_hash, nickname, role, created_at, updated_at)
VALUES (${sqlString(email)}, ${sqlString(passwordHash)}, ${sqlString(nickname)}, 'admin', ${sqlString(now)}, ${sqlString(now)})
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  nickname = excluded.nickname,
  role = 'admin',
  updated_at = excluded.updated_at;
`;

  const args = ["d1", "execute", "DB", "--command", sql, "--yes", remote ? "--remote" : "--local"];
  await runCommand("npx", ["wrangler", ...args]);
  console.log(`Cloudflare 管理员账号已初始化: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
