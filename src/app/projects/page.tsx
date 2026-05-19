import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileDown, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">我的书籍</h2>
            <p className="mt-1 text-sm text-text-muted">管理所有书籍项目，继续编辑或创建新书</p>
          </div>
          <Link className={cn(buttonVariants())} href="/projects/new">
            <Plus className="h-4 w-4" />
            创建新书
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="mb-4 text-sm text-text-muted">还没有书籍项目</p>
            <Link className={cn(buttonVariants())} href="/projects/new">
              <Plus className="h-4 w-4" />
              创建第一本书
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-text-primary">{project.title || project.topic}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{project.topic}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {project.status}
                    </Badge>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(project.updatedAt)}
                  </div>

                  <div className="mt-auto grid gap-2">
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                      href={`/projects/${project.id}/plan`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      继续编辑
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full")}
                      href={`/projects/${project.id}/export`}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      导出
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProjectShell>
  );
}
