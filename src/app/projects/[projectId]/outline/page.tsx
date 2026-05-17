import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PenLine } from "lucide-react";
import { OutlineEditor } from "@/components/outline/outline-editor";
import { ProjectShell } from "@/components/project/project-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { buildOutlineTree, listProjectOutlineNodes } from "@/lib/outline/service";
import { getProjectPlan, getUserProject } from "@/lib/projects/service";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectOutlinePage({ params }: PageProps) {
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
  const nodes = (await listProjectOutlineNodes(id, user.id)) ?? [];
  const tree = buildOutlineTree(nodes);

  return (
    <ProjectShell user={user}>
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href={`/projects/${id}/plan`}>
            <ArrowLeft className="h-4 w-4" />
            返回策划案
          </Link>
          <p className="text-sm font-medium text-zinc-500">图书目录</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{project.title || project.topic}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{project.topic}</p>
        </div>
        <Button variant="secondary" disabled title="Phase 4 开放">
          <PenLine className="h-4 w-4" />
          进入正文工作台
        </Button>
      </div>

      {!plan ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          请先生成图书策划案，再生成目录。
        </div>
      ) : null}

      <OutlineEditor projectId={id} initialTree={tree} />
    </ProjectShell>
  );
}
