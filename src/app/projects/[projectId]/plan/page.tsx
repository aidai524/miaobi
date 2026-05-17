import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { ProjectShell } from "@/components/project/project-shell";
import { PlanGenerateButton } from "@/components/project/plan-generate-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getProjectPlan, getUserProject } from "@/lib/projects/service";
import { formatDateTime, parseJsonArray } from "@/lib/format";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">{children}</div>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <TextBlock title={title}>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-zinc-400">暂无内容</span>
      )}
    </TextBlock>
  );
}

export default async function ProjectPlanPage({ params }: PageProps) {
  const user = await requireUser();
  const { projectId } = await params;
  const id = Number(projectId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const project = await getUserProject(id, user.id);
  if (!project) {
    notFound();
  }

  const plan = await getProjectPlan(id, user.id);
  const titleSuggestions = parseJsonArray(plan?.titleSuggestions);
  const subtitleSuggestions = parseJsonArray(plan?.subtitleSuggestions);
  const sellingPoints = parseJsonArray(plan?.sellingPoints);
  const risks = parseJsonArray(plan?.risks);

  return (
    <ProjectShell user={user}>
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/projects">
            <ArrowLeft className="h-4 w-4" />
            返回项目列表
          </Link>
          <p className="text-sm font-medium text-zinc-500">图书策划案</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{project.title || project.topic}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{project.topic}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PlanGenerateButton projectId={project.id} hasPlan={Boolean(plan)} />
          <Link className={cn(buttonVariants({ variant: "secondary" }))} href={`/projects/${project.id}/outline`}>
            进入目录生成
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{plan ? "策划结果" : "等待生成策划案"}</CardTitle>
            <CardDescription>
              {plan
                ? `最近生成：${formatDateTime(plan.updatedAt)}`
                : "点击“生成策划案”后，系统会调用 AI 并把结构化结果保存到数据库。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {plan ? (
              <>
                <TextBlock title="图书定位">{plan.positioning}</TextBlock>
                <TextBlock title="目标读者分析">{plan.targetReaderAnalysis}</TextBlock>
                <TextBlock title="内容切入角度">{plan.marketAngle}</TextBlock>
                <TextBlock title="核心承诺">{plan.corePromise}</TextBlock>
                <ListBlock title="书名建议" items={titleSuggestions} />
                <ListBlock title="副标题建议" items={subtitleSuggestions} />
                <ListBlock title="卖点" items={sellingPoints} />
                <TextBlock title="内容结构建议">{plan.structureSuggestion}</TextBlock>
                <ListBlock title="风险" items={risks} />
                <TextBlock title="编辑建议">{plan.editorialAdvice}</TextBlock>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                <BookOpen className="h-8 w-8 text-zinc-400" />
                <h3 className="mt-4 text-base font-semibold text-zinc-950">还没有策划案</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  AI 会根据主题、目标读者、书籍类型、写作风格和预计字数生成结构化策划案。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">项目参数</CardTitle>
            <CardDescription>这些信息会作为 AI 生成上下文。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-zinc-500">目标读者</p>
              <p className="mt-1 text-zinc-900">{project.targetReader || "未指定"}</p>
            </div>
            <div>
              <p className="text-zinc-500">书籍类型</p>
              <p className="mt-1 text-zinc-900">{project.bookType || "未指定"}</p>
            </div>
            <div>
              <p className="text-zinc-500">写作风格</p>
              <p className="mt-1 text-zinc-900">{project.writingStyle || "未指定"}</p>
            </div>
            <div>
              <p className="text-zinc-500">预计字数</p>
              <p className="mt-1 text-zinc-900">{project.expectedWordCount || "未指定"}</p>
            </div>
            <div>
              <p className="text-zinc-500">状态</p>
              <p className="mt-1 text-zinc-900">{project.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProjectShell>
  );
}
