# AI 出书 SaaS

AI 出书 SaaS v0.1，按 `ai-book-saas-codex-development-plan.md` 分 Phase 开发。当前完成 Phase 1 基础设施：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui 风格组件、Drizzle + SQLite、注册登录、cookie session、管理员 seed。

## Getting Started

复制环境变量示例，并设置管理员账号：

```bash
cp .env.example .env.local
```

初始化数据库并创建管理员：

```bash
npm run db:push
npm run db:seed
```

启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 数据与配置

- 默认数据库：`./data/database.sqlite`
- 默认文件根目录：`./data`
- 生产环境建议设置：`DATABASE_URL=file:/data/database.sqlite` 与 `STORAGE_ROOT=/data`
- 默认 AI 服务商预留为 Apimart + `gpt-5`，后续 Phase 接入具体调用链路。

## 常用命令

```bash
npm run lint
npm run build
```
