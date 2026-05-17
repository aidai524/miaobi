import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChapterStudio } from "@/components/studio/chapter-studio";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { ensureProjectChapters, listChapterVersions } from "@/lib/chapters/service";
import { buildOutlineTree, listProjectOutlineNodes } from "@/lib/outline/service";
import { getUserProject } from "@/lib/projects/service";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectStudioPage({ params }: PageProps) {
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

  const nodes = (await listProjectOutlineNodes(id, user.id)) ?? [];
  const outlineTree = buildOutlineTree(nodes);
  const chapters = (await ensureProjectChapters(id, user.id)) ?? [];
  const initialVersions = chapters[0] ? (await listChapterVersions(chapters[0].id, user.id)) ?? [] : [];

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href={`/projects/${id}/outline`}>
          <ArrowLeft className="h-4 w-4" />
          返回目录
        </Link>
        <p className="text-sm font-medium text-zinc-500">正文工作台</p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{project.title || project.topic}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{project.topic}</p>
      </div>

      {outlineTree.length ? (
        <ChapterStudio outlineTree={outlineTree} initialChapters={chapters} initialVersions={initialVersions} />
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-zinc-950">还没有目录</h3>
          <p className="mt-2 text-sm text-zinc-500">请先生成或编辑目录，再进入正文写作。</p>
          <Link className={cn(buttonVariants({ className: "mt-5" }))} href={`/projects/${id}/outline`}>
            去生成目录
          </Link>
        </div>
      )}
    </ProjectShell>
  );
}
