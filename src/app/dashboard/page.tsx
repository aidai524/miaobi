import Link from "next/link";
import { BookOpen, FileText, Layers, Settings } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

const modules = [
  {
    title: "图书项目",
    description: "创建选题、生成策划案、维护目录与正文。",
    icon: BookOpen,
    href: "/projects",
  },
  {
    title: "文本分析",
    description: "上传资料，提取结构、风格和可复用写作特征。",
    icon: FileText,
    href: "/analyze",
  },
  {
    title: "创作模型",
    description: "把文本分析结果沉淀为可复用的结构、风格和写作约束。",
    icon: Layers,
    href: "/models",
  },
  {
    title: "系统设置",
    description: "管理账号、AI 服务商和部署参数。",
    icon: Settings,
    href: null,
  },
];

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white px-5 py-6 lg:block">
          <div className="text-lg font-semibold text-zinc-950">AI 出书工作台</div>
          <nav className="mt-8 space-y-1 text-sm">
            <a className="block rounded-md bg-zinc-950 px-3 py-2 text-white" href="/dashboard">
              控制台
            </a>
            <span className="block rounded-md px-3 py-2 text-zinc-500">项目</span>
            <span className="block rounded-md px-3 py-2 text-zinc-500">分析</span>
            <span className="block rounded-md px-3 py-2 text-zinc-500">模型</span>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
            <div>
              <p className="text-sm text-zinc-500">欢迎回来</p>
              <h1 className="text-xl font-semibold text-zinc-950">{user.nickname || user.email}</h1>
            </div>
            <LogoutButton />
          </header>

          <div className="flex-1 px-5 py-6">
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6">
              <p className="text-sm font-medium text-zinc-500">Phase 1</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">基础设施已就绪</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                当前已包含注册登录、SQLite 数据层、会话保护和后台基础布局。下一阶段会开始图书项目与 AI 策划案。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {modules.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <item.icon className="h-5 w-5 text-zinc-700" />
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.href ? (
                      <Link className="text-sm font-medium text-zinc-950 hover:underline" href={item.href}>
                        进入模块
                      </Link>
                    ) : (
                      <p className="text-xs text-zinc-400">后续 Phase 开放</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
