import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateProjectFromModelForm } from "@/components/models/create-project-from-model-form";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { parseJsonArray } from "@/lib/format";
import { getUserModel } from "@/lib/models/service";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ modelId: string }>;
};

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
        {children || <span className="text-zinc-400">暂无内容</span>}
      </div>
    </section>
  );
}

export default async function ModelDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { modelId } = await params;
  const id = Number(modelId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const model = await getUserModel(id, user.id);
  if (!model) {
    notFound();
  }
  const tags = parseJsonArray(model.tags);

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/models">
          <ArrowLeft className="h-4 w-4" />
          返回模型列表
        </Link>
        <p className="text-sm font-medium text-zinc-500">创作模型</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{model.name}</h1>
        {tags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>模型详情</CardTitle>
            <CardDescription>这些内容会作为后续 AI 生成的参考约束。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextBlock title="模型摘要">{model.modelSummary}</TextBlock>
            <TextBlock title="适用场景">{model.applicableScenarios}</TextBlock>
            <TextBlock title="目标读者">{model.targetReader}</TextBlock>
            <TextBlock title="结构模式">{model.structurePattern}</TextBlock>
            <TextBlock title="语言模式">{model.languagePattern}</TextBlock>
            <TextBlock title="内容模式">{model.contentPattern}</TextBlock>
            <TextBlock title="写作指南">{model.writingGuidelines}</TextBlock>
            <TextBlock title="避免事项">{model.avoidRules}</TextBlock>
            <TextBlock title="提示词模板">{model.promptTemplate}</TextBlock>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>创建新书</CardTitle>
            <CardDescription>新项目会自动引用该创作模型。</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants({ variant: "outline" }), "mb-4 w-full")} href={`/projects/new?modelId=${model.id}`}>
              在新建页使用此模型
            </Link>
            <CreateProjectFromModelForm modelId={model.id} />
          </CardContent>
        </Card>
      </div>
    </ProjectShell>
  );
}
