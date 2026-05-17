# AI 出书 SaaS

AI 出书 SaaS v0.1，按 `ai-book-saas-codex-development-plan.md` 分 Phase 开发。当前完成 Phase 1-3：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui 风格组件、Drizzle + SQLite、注册登录、cookie session、管理员 seed、图书项目创建、AI 策划案生成、三级目录生成与编辑。

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
- 默认 AI 服务商为 Apimart + `deepseek-v3.2`，需要配置 `APIMART_API_KEY` 和 `APIMART_BASE_URL`
- 其他服务商可通过 `AI_DEFAULT_PROVIDER`、`AI_DEFAULT_MODEL` 以及对应环境变量切换

## 常用命令

```bash
npm run lint
npm run build
```

## Phase 2 路由

- `/projects`：项目列表
- `/projects/new`：新建图书项目
- `/projects/[projectId]/plan`：查看与生成图书策划案
- `POST /api/projects/[projectId]/generate-plan`：调用 AI 并保存策划案

## Phase 3 路由

- `/projects/[projectId]/outline`：生成、查看、编辑三级目录
- `POST /api/projects/[projectId]/generate-outline`：调用 AI 并覆盖生成完整目录
- `GET /api/projects/[projectId]/outline`：读取目录节点与树形结构
- `POST /api/projects/[projectId]/outline/nodes`：新增目录节点
- `PATCH /api/outline/nodes/[nodeId]`：编辑目录节点
- `DELETE /api/outline/nodes/[nodeId]`：删除目录节点及其子节点
