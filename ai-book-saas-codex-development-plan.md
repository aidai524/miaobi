# AI 出书 SaaS v0.1 — Codex 开发任务拆解

> 项目目标：构建一个低复杂度、可快速上线验证的 AI 出书 SaaS。  
> 技术原则：**单体应用、Linux 单机、SQLite、本地文件存储、优先跑通产品闭环。**

---

# 1. 技术栈约束

## 1.1 必须采用

- **Next.js**：App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **SQLite**
- **Drizzle ORM**，如果 Codex 对 Prisma 更稳，也可使用 Prisma，但优先 Drizzle
- **本地文件存储**
- **AI 接口统一封装**
- **Linux 单机部署**
- **Nginx + PM2 或 systemd**

## 1.2 暂不使用

- PostgreSQL
- Redis
- 消息队列
- 微服务
- Docker 非必须
- 对象存储
- Kubernetes
- 复杂权限系统
- 支付系统

---

# 2. 产品 MVP 范围

## 2.1 核心闭环

用户可以：

1. 注册登录；
2. 创建图书项目；
3. 输入一个图书主题；
4. 调用 AI 生成图书策划案；
5. 调用 AI 生成三级目录；
6. 编辑目录；
7. 点击某章节生成正文；
8. 编辑和保存正文；
9. 上传文本文件；
10. 对文本进行 AI 分析；
11. 保存为创作模型；
12. 基于创作模型创建新书；
13. 导出 Markdown 书稿。

---

# 3. 代码结构建议

```bash
src/
  app/
    (auth)/
      login/
      register/
    dashboard/
    projects/
      new/
      [projectId]/
        plan/
        outline/
        studio/
    analyze/
    models/
    books/
    authors/
    settings/
    api/
      auth/
      projects/
      documents/
      analyses/
      models/
      books/
      authors/
  components/
    layout/
    auth/
    dashboard/
    project/
    plan/
    outline/
    studio/
    analyze/
    models/
    library/
    ui/
  lib/
    db/
      schema.ts
      index.ts
    auth/
    ai/
      client.ts
      prompts.ts
      types.ts
      book-plan.ts
      outline.ts
      chapter.ts
      analysis.ts
      model.ts
    files/
      upload.ts
      extract.ts
      export.ts
    utils/
  types/
  data/
    database.sqlite
    uploads/
    exports/
```

---

# 4. 数据库表设计

## 4.1 users

```sql
users
- id INTEGER PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- nickname TEXT
- role TEXT DEFAULT 'user'
- created_at DATETIME
- updated_at DATETIME
```

## 4.2 book_projects

```sql
book_projects
- id INTEGER PRIMARY KEY
- user_id INTEGER NOT NULL
- title TEXT
- topic TEXT NOT NULL
- target_reader TEXT
- book_type TEXT
- writing_style TEXT
- expected_word_count INTEGER
- reference_model_id INTEGER NULL
- status TEXT DEFAULT 'draft'
- created_at DATETIME
- updated_at DATETIME
```

## 4.3 book_plans

```sql
book_plans
- id INTEGER PRIMARY KEY
- project_id INTEGER NOT NULL
- positioning TEXT
- target_reader_analysis TEXT
- market_angle TEXT
- core_promise TEXT
- title_suggestions TEXT
- subtitle_suggestions TEXT
- selling_points TEXT
- structure_suggestion TEXT
- risks TEXT
- editorial_advice TEXT
- ai_raw_output TEXT
- created_at DATETIME
- updated_at DATETIME
```

> 注：数组/复杂结构 MVP 可直接 JSON 字符串保存。

## 4.4 outline_nodes

```sql
outline_nodes
- id INTEGER PRIMARY KEY
- project_id INTEGER NOT NULL
- parent_id INTEGER NULL
- level INTEGER NOT NULL
- sort_order INTEGER NOT NULL
- title TEXT NOT NULL
- summary TEXT
- writing_goal TEXT
- suggested_word_count INTEGER
- created_at DATETIME
- updated_at DATETIME
```

## 4.5 chapters

```sql
chapters
- id INTEGER PRIMARY KEY
- project_id INTEGER NOT NULL
- outline_node_id INTEGER NOT NULL
- title TEXT NOT NULL
- content TEXT
- status TEXT DEFAULT 'draft'
- word_count INTEGER DEFAULT 0
- created_at DATETIME
- updated_at DATETIME
```

## 4.6 chapter_versions

```sql
chapter_versions
- id INTEGER PRIMARY KEY
- chapter_id INTEGER NOT NULL
- version_no INTEGER NOT NULL
- content TEXT NOT NULL
- created_by TEXT DEFAULT 'ai'
- created_at DATETIME
```

## 4.7 uploaded_documents

```sql
uploaded_documents
- id INTEGER PRIMARY KEY
- user_id INTEGER NOT NULL
- original_filename TEXT NOT NULL
- stored_path TEXT NOT NULL
- file_type TEXT
- file_size INTEGER
- extracted_text TEXT
- status TEXT DEFAULT 'uploaded'
- created_at DATETIME
- updated_at DATETIME
```

## 4.8 text_analyses

```sql
text_analyses
- id INTEGER PRIMARY KEY
- user_id INTEGER NOT NULL
- document_id INTEGER NOT NULL
- analysis_type TEXT
- summary TEXT
- content_topics TEXT
- reader_profile TEXT
- structure_analysis TEXT
- style_analysis TEXT
- reusable_traits TEXT
- writing_advice TEXT
- ai_raw_output TEXT
- created_at DATETIME
```

## 4.9 writing_models

```sql
writing_models
- id INTEGER PRIMARY KEY
- user_id INTEGER NOT NULL
- name TEXT NOT NULL
- source_type TEXT
- source_analysis_id INTEGER
- model_summary TEXT
- applicable_scenarios TEXT
- target_reader TEXT
- structure_pattern TEXT
- language_pattern TEXT
- content_pattern TEXT
- writing_guidelines TEXT
- avoid_rules TEXT
- prompt_template TEXT
- created_at DATETIME
- updated_at DATETIME
```

## 4.10 public_books

```sql
public_books
- id INTEGER PRIMARY KEY
- title TEXT NOT NULL
- subtitle TEXT
- author_name TEXT
- publisher TEXT
- publish_date TEXT
- category TEXT
- tags TEXT
- summary TEXT
- table_of_contents TEXT
- recommendation_reason TEXT
- cover_url TEXT
- source_note TEXT
- created_at DATETIME
- updated_at DATETIME
```

## 4.11 public_authors

```sql
public_authors
- id INTEGER PRIMARY KEY
- name TEXT NOT NULL
- bio TEXT
- main_fields TEXT
- representative_books TEXT
- writing_traits TEXT
- tags TEXT
- created_at DATETIME
- updated_at DATETIME
```

---

# 5. 开发阶段总览

| 阶段 | 目标 | 交付物 |
|---|---|---|
| Phase 1 | 项目基础设施 | 登录注册 + 布局 + SQLite |
| Phase 2 | 图书项目与策划案 | 创建项目 + AI 策划案 |
| Phase 3 | 目录生成与编辑 | 三级目录 + 编辑保存 |
| Phase 4 | 正文工作台 | 生成正文 + 编辑 + 版本 |
| Phase 5 | 上传文本与分析 | 文件上传 + 文本提取 + AI 分析 |
| Phase 6 | 创作模型 | 保存模型 + 基于模型创建 |
| Phase 7 | 图书库与作者库 | 公共数据库展示 + 基础后台导入 |
| Phase 8 | 导出 | Markdown 导出 |

---

# 6. Phase 1：项目基础框架

## 6.1 目标

构建可以运行的项目基础：

- Next.js App Router 项目
- Tailwind
- shadcn/ui
- SQLite + ORM
- 用户注册登录
- 登录态管理
- 基础后台布局

## 6.2 页面

### `/login`
- 邮箱
- 密码
- 登录按钮
- 跳转注册

### `/register`
- 邮箱
- 密码
- 昵称
- 注册按钮

### `/dashboard`
- 需要登录
- 显示欢迎语
- 预留主导航

## 6.3 接口

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```

## 6.4 验收标准

- 用户可以注册；
- 密码加密保存；
- 用户可以登录；
- 未登录访问 dashboard 自动跳转到 login；
- 登录后显示昵称；
- 可以退出登录。

---

# 7. Phase 2：图书项目与策划案生成

## 7.1 目标

实现：

- 创建新书项目；
- 保存项目基本信息；
- 调用 AI 生成图书策划案；
- 将策划案保存到数据库；
- 在页面展示策划结果。

## 7.2 页面

### `/projects/new`

字段：
- 书籍主题 `topic`，必填
- 目标读者 `target_reader`
- 书籍类型 `book_type`
- 写作风格 `writing_style`
- 预计字数 `expected_word_count`

按钮：
- `生成图书策划`

### `/projects/[projectId]/plan`

展示：
- 图书定位
- 目标读者分析
- 市场切入角度
- 核心承诺
- 书名建议
- 副标题建议
- 卖点
- 内容结构建议
- 风险与编辑建议

按钮：
- 重新生成策划案
- 进入目录生成

## 7.3 接口

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

POST   /api/projects/:id/generate-plan
GET    /api/projects/:id/plan
```

## 7.4 AI Service

实现：

```ts
generateBookPlan(input): Promise<BookPlanResult>
```

输入：
```ts
{
  topic: string
  targetReader?: string
  bookType?: string
  writingStyle?: string
  expectedWordCount?: number
}
```

输出必须转换成结构化 JSON。

## 7.5 验收标准

- 用户能创建项目；
- AI 能返回策划案；
- 策划案能保存数据库；
- 刷新页面仍能读取；
- 重新生成会覆盖或创建新版，MVP 可先覆盖。

---

# 8. Phase 3：目录生成与编辑

## 8.1 目标

- 基于策划案生成三级目录；
- 保存到 outline_nodes；
- 展示树形结构；
- 支持标题、摘要、字数编辑；
- 支持新增/删除节点；
- 支持重新生成完整目录。

## 8.2 页面

### `/projects/[projectId]/outline`

布局：
- 左侧：目录树
- 右侧：节点详情编辑表单

左侧显示：
- 第一编 / 第一部分
- 第 1 章
- 1.1 小节

右侧编辑：
- 标题
- 摘要
- 写作目标
- 建议字数

按钮：
- 生成目录
- 新增同级节点
- 新增子节点
- 删除节点
- 保存修改

## 8.3 接口

```http
POST   /api/projects/:id/generate-outline
GET    /api/projects/:id/outline
POST   /api/projects/:id/outline/nodes
PATCH  /api/outline/nodes/:nodeId
DELETE /api/outline/nodes/:nodeId
```

## 8.4 AI Service

```ts
generateOutline(input): Promise<OutlineResult>
```

输入：
- 图书策划案；
- 项目信息；
- 参考模型，可为空。

输出：
- 结构化目录树。

## 8.5 验收标准

- 能生成三级目录；
- 能正确写入 outline_nodes；
- 能渲染树；
- 能编辑和保存；
- 删除节点后页面刷新仍正确；
- 生成目录时，不会覆盖项目基本信息。

---

# 9. Phase 4：正文工作台

## 9.1 目标

- 用户点击目录中的章或节，进入写作区；
- 若无章节正文，可点击生成；
- AI 按当前节点生成正文；
- 用户可以编辑正文；
- 保存正文；
- 记录历史版本。

## 9.2 页面

### `/projects/[projectId]/studio`

布局：
- 左侧：目录树
- 中间：正文编辑区
- 右侧：AI 助手操作区

AI 助手按钮：
- 生成正文
- 扩写
- 精简
- 改得更通俗
- 改得更专业
- 增加案例
- 生成小结
- 生成金句

## 9.3 接口

```http
GET    /api/projects/:id/chapters
GET    /api/chapters/:chapterId
POST   /api/chapters/:chapterId/generate
PATCH  /api/chapters/:chapterId
POST   /api/chapters/:chapterId/rewrite
GET    /api/chapters/:chapterId/versions
POST   /api/chapters/:chapterId/restore-version
```

## 9.4 AI Service

```ts
generateChapter(input): Promise<string>
rewriteChapter(input): Promise<string>
```

生成正文时，应传入：
- 项目主题；
- 策划案；
- 当前章节标题；
- 当前章节摘要；
- 当前章节写作目标；
- 当前章节建议字数；
- 前后章节标题；
- 参考模型，可为空。

## 9.5 版本机制

每次发生以下动作，都新增一条 version：
- AI 生成正文；
- AI 改写正文；
- 用户手动点击“保存版本”。

MVP 不做自动秒级保存版本，避免数据过多。

## 9.6 验收标准

- 能为章节生成正文；
- 生成正文保存到 chapters；
- 用户编辑后能保存；
- 有历史版本列表；
- 能恢复某个历史版本。

---

# 10. Phase 5：上传文本与分析

## 10.1 目标

- 支持文件上传；
- 支持提取文本；
- 支持 AI 分析；
- 分析结果保存到数据库；
- 分析结果页面展示。

## 10.2 支持文件

- `.txt`
- `.md`
- `.docx`
- `.pdf`

## 10.3 文件存储

Linux 本地：

```bash
/data/uploads/{userId}/{timestamp}_{filename}
```

## 10.4 文本提取建议

- txt/md：直接读
- docx：使用 mammoth 或同类 Node 包
- pdf：使用 pdf-parse 或同类 Node 包

MVP 阶段：
- 只提取普通文本；
- 不处理复杂表格；
- 不处理图片；
- 不处理扫描版 PDF OCR。

## 10.5 页面

### `/analyze`

功能：
- 上传文件
- 选择分析目标：
  - 分析作者风格
  - 分析内容结构
  - 分析是否适合出书
  - 生成创作模型

### `/analyze/[analysisId]`

展示：
- 内容摘要
- 主要主题
- 读者定位
- 结构特点
- 表达风格
- 可复用创作特征
- 写作建议

按钮：
- 保存为创作模型
- 基于此分析创建新书

## 10.6 接口

```http
POST /api/documents/upload
GET  /api/documents
GET  /api/documents/:id
POST /api/documents/:id/analyze
GET  /api/analyses/:id
```

## 10.7 AI Service

```ts
analyzeText(input): Promise<TextAnalysisResult>
```

输入：
- 提取后的文本；
- 分析目标。

若文本过长：
- MVP 可先截断；
- 或做简单分段总结后再汇总；
- 推荐 Codex 实现一个基础 `summarizeChunks -> finalAnalysis` 流程，以便适配长文本。

## 10.8 验收标准

- 文件可上传；
- 数据库记录文件；
- 可提取文本；
- 调用 AI 生成分析；
- 分析结果保存；
- 页面刷新可恢复。

---

# 11. Phase 6：创作模型

## 11.1 目标

- 从文本分析结果生成创作模型；
- 用户可保存模型；
- 模型可用于创建新书。

## 11.2 页面

### `/models`
展示卡片：
- 模型名称
- 来源
- 创建时间
- 标签
- 简述

### `/models/[modelId]`
展示：
- 模型摘要
- 适用场景
- 目标读者
- 结构模式
- 语言模式
- 内容模式
- 写作指南
- 避免事项

按钮：
- 基于此模型创建新书

## 11.3 接口

```http
POST   /api/analyses/:id/save-as-model
GET    /api/models
GET    /api/models/:id
PATCH  /api/models/:id
DELETE /api/models/:id
POST   /api/models/:id/create-project
```

## 11.4 AI Service

```ts
createWritingModel(input): Promise<WritingModelResult>
```

## 11.5 验收标准

- 用户可将分析结果保存成模型；
- 模型详情可查看；
- 可基于模型跳转到创建新书页；
- 新建项目时带上 `reference_model_id`；
- 后续策划案与目录生成会读取该模型内容。

---

# 12. Phase 7：图书库与作者库

## 12.1 目标

建立一个轻量公共灵感库。

## 12.2 图书库页面 `/books`

支持：
- 列表展示
- 搜索书名
- 搜索作者
- 按分类筛选
- 查看详情

### 图书详情 `/books/[bookId]`
展示：
- 书名
- 副标题
- 作者
- 出版社
- 出版时间
- 分类
- 标签
- 简介
- 目录
- 推荐理由

按钮：
- 以此为灵感创建新书
- 若未来要分析，可先提示“后续开放”

## 12.3 作者库 `/authors`

展示：
- 作者姓名
- 领域
- 代表书
- 风格标签

## 12.4 管理员后台

可先做简单 `/admin/books` 与 `/admin/authors`。

功能：
- 新增
- 编辑
- 删除
- JSON 导入

## 12.5 验收标准

- 用户能浏览图书和作者；
- 后台能维护数据；
- 图书详情数据能正常展示。

---

# 13. Phase 8：导出

## 13.1 目标

导出完整书稿 Markdown。

## 13.2 导出规则

顺序：
1. 书名
2. 策划案摘要，可选
3. 目录
4. 正文，按目录顺序拼接

## 13.3 接口

```http
GET /api/projects/:id/export/markdown
```

## 13.4 文件存储

输出到：

```bash
/data/exports/{projectId}/book_{timestamp}.md
```

并返回下载链接。

## 13.5 验收标准

- 可生成 `.md` 文件；
- 章节顺序正确；
- 页面可下载。

---

# 14. AI Prompt 设计原则

所有 AI 调用必须遵循：

1. 尽量要求输出 JSON；
2. 生成类任务与分析类任务分开；
3. 上下文尽可能结构化；
4. 不要让模型凭空吹嘘市场数据；
5. 若没有真实市场数据，只做“内容层面的定位建议”，不要假装有销量结论；
6. 分析参考文本时强调：
   - 提炼结构与方法；
   - 不复制原文；
   - 为原创创作服务。

---

# 15. 错误处理

每个 AI 操作都要有：

- loading 状态；
- 成功状态；
- 失败提示；
- 重试按钮。

错误提示示例：
- `生成失败，请稍后重试`
- `上传成功，但文本解析失败`
- `AI 分析未完成，请重新发起`

---

# 16. UI 风格建议

整体风格：
- 专业
- 编辑工作台感
- 有知识产品气质
- 不要过度“科技蓝炫酷”
- 适合长时间写作

建议：
- 浅色主界面
- 局部深色强调
- 卡片化模块
- 文本编辑区域留白充足
- 左侧导航固定
- 工作区布局清晰

---

# 17. 交付验收总清单

完成以下内容，即为 v0.1：

- [x] 用户注册登录
- [x] Dashboard
- [x] 新建图书项目
- [x] AI 生成策划案
- [x] AI 生成目录
- [x] 目录树编辑
- [x] 正文工作台
- [x] AI 生成正文
- [x] 正文改写按钮
- [x] 章节版本历史
- [x] 文件上传
- [x] 文本提取
- [x] AI 文本分析
- [x] 保存创作模型
- [x] 基于模型创建新书
- [ ] 图书库
- [ ] 作者库
- [ ] 管理员基础维护
- [ ] Markdown 导出
- [ ] Linux 部署说明

---

# 18. Codex 使用建议

不要一次性把全部 PRD 丢给 Codex 要它全部完成。

推荐方式：
- 一次只给一个 Phase；
- 要求它先阅读现有项目；
- 先输出实现计划；
- 再动手编码；
- 完成后让它列出：
  - 修改文件
  - 新增文件
  - 数据库迁移
  - 本地测试步骤
  - 遗留问题

推荐指令模板：

```md
你现在作为资深全栈工程师，继续开发当前 Next.js 项目。

请先完整阅读现有代码结构，然后根据下面的 Phase X 需求完成开发。
要求：
1. 不要重构无关代码；
2. 优先保证功能可运行；
3. 使用现有技术栈；
4. 数据库使用 SQLite；
5. 所有新增接口需有基础错误处理；
6. 完成后总结：
   - 修改了哪些文件
   - 新增了哪些文件
   - 如何本地测试
   - 是否有待确认问题
```
