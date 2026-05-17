import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getUserAnalysis } from "@/lib/analysis/service";
import { parseJsonArray } from "@/lib/format";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ analysisId: string }>;
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

export default async function AnalysisDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { analysisId } = await params;
  const id = Number(analysisId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const result = await getUserAnalysis(id, user.id);
  if (!result) {
    notFound();
  }

  const { analysis, document } = result;

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/analyze">
          <ArrowLeft className="h-4 w-4" />
          返回文本分析
        </Link>
        <p className="text-sm font-medium text-zinc-500">分析结果</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{document.originalFilename}</h1>
        <p className="mt-2 text-sm text-zinc-600">分析类型：{analysis.analysisType || "-"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>文本分析报告</CardTitle>
          <CardDescription>基于提取文本生成，用于后续原创创作。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <TextBlock title="内容摘要">{analysis.summary}</TextBlock>
          <ListBlock title="主要主题" items={parseJsonArray(analysis.contentTopics)} />
          <TextBlock title="读者定位">{analysis.readerProfile}</TextBlock>
          <TextBlock title="结构特点">{analysis.structureAnalysis}</TextBlock>
          <TextBlock title="表达风格">{analysis.styleAnalysis}</TextBlock>
          <ListBlock title="可复用创作特征" items={parseJsonArray(analysis.reusableTraits)} />
          <ListBlock title="写作建议" items={parseJsonArray(analysis.writingAdvice)} />
          <div className="flex flex-wrap gap-2 pt-2">
            <Link className={cn(buttonVariants())} href={`/api/analyses/${analysis.id}`}>
              查看原始 JSON
            </Link>
            <Link className={cn(buttonVariants({ variant: "secondary" }))} href="/models">
              保存为创作模型
            </Link>
          </div>
        </CardContent>
      </Card>
    </ProjectShell>
  );
}
