import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { ProjectExportClient } from "@/components/export/markdown-export-client";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { ensureProjectChapters } from "@/lib/chapters/service";
import { parseId } from "@/lib/http";
import { listProjectOutlineNodes } from "@/lib/outline/service";
import { getProjectPlan, getUserProject } from "@/lib/projects/service";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectExportPage({ params }: PageProps) {
  const user = await requireUser();
  const { projectId } = await params;
  const id = parseId(projectId);

  if (!id) {
    notFound();
  }

  const project = await getUserProject(id, user.id);
  if (!project) {
    notFound();
  }

  const [plan, nodes, chapters] = await Promise.all([
    getProjectPlan(id, user.id),
    listProjectOutlineNodes(id, user.id),
    ensureProjectChapters(id, user.id),
  ]);

  const chapterCount = chapters?.length ?? 0;
  const writtenCount = chapters?.filter((chapter) => chapter.content?.trim()).length ?? 0;

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href={`/projects/${id}/studio`}>
          <ArrowLeft className="h-4 w-4" />
          返回正文工作台
        </Link>
        <p className="text-sm font-medium text-zinc-500">Book Export</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{project.title || project.topic}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          导出文件会包含书名、策划案摘要、目录和按目录顺序拼接的正文，可下载 Markdown 或 Word 文件。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle>生成导出文件</CardTitle>
            <CardDescription>每次生成都会写入一个新的导出文件，支持 Markdown 和 Word。</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectExportClient projectId={id} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              导出内容
            </CardTitle>
            <CardDescription>当前项目可导出的内容概览。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info label="策划案摘要" value={plan ? "已包含" : "未生成"} />
            <Info label="目录节点" value={`${nodes?.length ?? 0} 个`} />
            <Info label="正文节点" value={`${chapterCount} 个`} />
            <Info label="已有正文" value={`${writtenCount} 个`} />
            {!nodes?.length ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                当前没有目录，导出文件会只包含基础信息。
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ProjectShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900">{value}</span>
    </div>
  );
}
