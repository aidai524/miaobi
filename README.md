# AI 出书 SaaS

AI 出书 SaaS v0.1，按 `ai-book-saas-codex-development-plan.md` 分 Phase 开发。当前完成 Phase 1-8：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui 风格组件、Drizzle + SQLite、注册登录、cookie session、管理员 seed、图书项目创建、AI 策划案生成、三级目录生成与编辑、正文工作台与版本历史、文件上传与文本分析、创作模型沉淀与复用、公共图书库与作者库、Markdown 导出。

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
- 默认 AI 服务商为 Apimart + `deepseek-v3-0324`，需要配置 `APIMART_API_KEY` 和 `APIMART_BASE_URL`
- 其他服务商可通过 `AI_DEFAULT_PROVIDER`、`AI_DEFAULT_MODEL` 以及对应环境变量切换

## 常用命令

```bash
npm run lint
npm run build
```

## 部署

### 自有服务器

当前 Node.js 部署继续使用本地 SQLite 和本地文件目录，适合单机测试或小规模内测：

```bash
npm ci
cp .env.example .env.production
npm run db:push
npm run db:seed
npm run build
PORT=3000 npm run start
```

生产建议配置：

```bash
DATABASE_URL="file:/data/aibook/database.sqlite"
STORAGE_ROOT="/data/aibook"
```

前面用 Nginx/Caddy 反代到 `127.0.0.1:3000`，并用 systemd 或 PM2 守护进程。

### Cloudflare Workers

Cloudflare 部署使用 OpenNext + Workers，数据库使用 D1，上传和导出文件使用 R2。

首次准备：

```bash
npm ci
npx wrangler login
npx wrangler d1 create ai-book-saas
npx wrangler r2 bucket create ai-book-saas-storage
npx wrangler r2 bucket create ai-book-saas-opennext-cache
```

把 D1 创建后返回的 `database_id` 写入 `wrangler.jsonc`。本地预览可复制 `.dev.vars.example` 为 `.dev.vars`，生产密钥用 Wrangler secrets：

```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put APIMART_API_KEY
npx wrangler secret put APIMART_BASE_URL
```

D1 初始化：

```bash
npm run db:migrate:cf:local
npm run db:seed:cf:local
```

本地 Cloudflare 运行时预览：

```bash
npm run build:cf
npm run preview:cf
```

部署到 Cloudflare：

```bash
npm run db:migrate:cf
npm run db:seed:cf
npm run deploy:cf
```

远程生成 Drizzle 迁移时需要在本机设置 `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_D1_DATABASE_ID`、`CLOUDFLARE_API_TOKEN`，然后执行：

```bash
npm run db:generate:cf
```

注意：Cloudflare 部署下暂只支持上传并解析 `txt/md`；`docx/pdf` 解析依赖 Node 生态包，后续作为 Workers 兼容性专项处理。自有服务器部署仍支持 `txt/md/docx/pdf`。

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

## Phase 4 路由

- `/projects/[projectId]/studio`：正文工作台
- `GET /api/projects/[projectId]/chapters`：按目录自动补齐并读取章节
- `GET /api/chapters/[chapterId]`：读取章节正文
- `PATCH /api/chapters/[chapterId]`：保存正文，可选择保存版本
- `POST /api/chapters/[chapterId]/generate`：调用 AI 生成正文并记录版本
- `POST /api/chapters/[chapterId]/rewrite`：调用 AI 改写正文并记录版本
- `GET /api/chapters/[chapterId]/versions`：读取版本历史
- `POST /api/chapters/[chapterId]/restore-version`：恢复版本并记录恢复历史

## Phase 5 路由

- `/analyze`：上传文本并发起分析
- `/analyze/[analysisId]`：查看文本分析报告
- `POST /api/documents/upload`：上传并提取 txt、md、docx、pdf 文本
- `GET /api/documents`：读取上传文档列表
- `GET /api/documents/[documentId]`：读取文档详情
- `POST /api/documents/[documentId]/analyze`：调用 AI 生成文本分析
- `GET /api/analyses/[analysisId]`：读取分析详情

## Phase 6 路由

- `/models`：创作模型列表
- `/models/[modelId]`：创作模型详情，并可基于模型创建新书
- `POST /api/analyses/[analysisId]/save-as-model`：把分析报告转成创作模型
- `GET /api/models`：读取创作模型列表
- `GET /api/models/[modelId]`：读取创作模型详情
- `PATCH /api/models/[modelId]`：更新创作模型内容
- `DELETE /api/models/[modelId]`：删除创作模型
- `POST /api/models/[modelId]/create-project`：基于创作模型创建新书项目

## Phase 7 路由

- `/books`：公共图书库，支持书名、作者和分类筛选
- `/books/[bookId]`：图书详情，并可带入灵感信息创建新书
- `/authors`：公共作者库，支持作者、代表作、风格和领域筛选
- `/admin/books`：管理员图书后台，支持新增、编辑、删除、JSON 导入
- `/admin/authors`：管理员作者后台，支持新增、编辑、删除、JSON 导入
- `GET /api/books`：读取公共图书列表
- `GET /api/books/[bookId]`：读取公共图书详情
- `GET /api/authors`：读取公共作者列表
- `GET /api/authors/[authorId]`：读取公共作者详情
- `POST /api/admin/books`：管理员新增图书
- `PATCH /api/admin/books/[bookId]`：管理员更新图书
- `DELETE /api/admin/books/[bookId]`：管理员删除图书
- `POST /api/admin/books/import`：管理员 JSON 导入图书
- `POST /api/admin/authors`：管理员新增作者
- `PATCH /api/admin/authors/[authorId]`：管理员更新作者
- `DELETE /api/admin/authors/[authorId]`：管理员删除作者
- `POST /api/admin/authors/import`：管理员 JSON 导入作者

## Phase 8 路由

- `/projects/[projectId]/export`：项目 Markdown 导出页
- `GET /api/projects/[projectId]/export/markdown`：生成完整书稿 Markdown，写入 `data/exports/{projectId}`
- `GET /api/projects/[projectId]/exports/[filename]`：下载已生成的 Markdown 文件
