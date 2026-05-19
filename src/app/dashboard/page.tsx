import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Layers, Library, PenLine, Settings, Sparkles, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectShell } from "@/components/project/project-shell";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

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
    title: "图书库",
    description: "浏览公共图书资料，按书名、作者和分类寻找新书灵感。",
    icon: Library,
    href: "/books",
  },
  {
    title: "作者库",
    description: "查看作者领域、代表作和风格标签，辅助建立参考范式。",
    icon: PenLine,
    href: "/authors",
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
    <ProjectShell user={user}>
      <div className="space-y-8 p-6">
        <section className="rounded-2xl border border-border-light bg-bg-card p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight text-text-primary">
                让任何人，都能完成一本真正像样的书
              </h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-text-secondary">
                从选题定位、标杆分析、目录设计，到章节写作与书稿导出，一站完成。
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link className={cn(buttonVariants({ size: "lg" }))} href="/projects/new">
                  <Sparkles className="h-4 w-4" />
                  创建我的第一本书
                </Link>
                <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/analyze">
                  <Upload className="h-4 w-4" />
                  上传文本，生成创作模型
                </Link>
              </div>
            </div>
            <div className="hidden h-36 w-48 items-center justify-center rounded-2xl bg-accent-light lg:flex">
              <BookOpen className="h-16 w-16 text-accent/40" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">功能模块</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((item) => (
              <Card key={item.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {item.href ? (
                    <Link className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline" href={item.href}>
                      进入模块
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <p className="text-xs text-text-muted">后续开放</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ProjectShell>
  );
}
