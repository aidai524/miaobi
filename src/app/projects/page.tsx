import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectShell } from "@/components/project/project-shell";
import { requireUser } from "@/lib/auth/session";
import { listUserProjects } from "@/lib/projects/service";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listUserProjects(user.id);

  return (
    <ProjectShell user={user}>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-zinc-500">Projects</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">图书项目</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">管理选题、策划案和后续写作流程。</p>
        </div>
        <Link className={cn(buttonVariants())} href="/projects/new">
          <Plus className="h-4 w-4" />
          新建项目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-zinc-950">还没有图书项目</h3>
          <p className="mt-2 text-sm text-zinc-500">从一个主题开始，让 AI 先生成策划案。</p>
          <Link className={cn(buttonVariants({ className: "mt-5" }))} href="/projects/new">
            <Plus className="h-4 w-4" />
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">{project.title || project.topic}</CardTitle>
                <CardDescription className="line-clamp-3">{project.topic}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="grid gap-2 text-sm text-zinc-500">
                  <div className="flex justify-between gap-4">
                    <span>状态</span>
                    <span className="font-medium text-zinc-800">{project.status}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>更新时间</span>
                    <span className="text-zinc-800">{formatDateTime(project.updatedAt)}</span>
                  </div>
                </div>
                <Link
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  href={`/projects/${project.id}/plan`}
                >
                  查看策划案
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ProjectShell>
  );
}
