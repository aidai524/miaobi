import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCreateForm } from "@/components/project/project-create-form";
import { ProjectShell } from "@/components/project/project-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/projects">
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>
        <h2 className="text-2xl font-semibold text-zinc-950">新建图书项目</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">输入选题基本信息，下一步生成图书策划案。</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>项目基本信息</CardTitle>
          <CardDescription>信息越具体，策划案越容易贴近你的真实目标。</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectCreateForm />
        </CardContent>
      </Card>
    </ProjectShell>
  );
}
