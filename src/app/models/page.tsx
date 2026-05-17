import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { listUserModels } from "@/lib/models/service";
import { formatDateTime, parseJsonArray } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ModelsPage() {
  const user = await requireUser();
  const models = await listUserModels(user.id);

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Models</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">创作模型</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          从文本分析沉淀结构、语言和内容模式，用于后续新书策划、目录和正文生成。
        </p>
      </div>

      {models.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-zinc-950">还没有创作模型</h3>
          <p className="mt-2 text-sm text-zinc-500">先上传文本并生成分析报告，再保存为创作模型。</p>
          <Link className={cn(buttonVariants({ className: "mt-5" }))} href="/analyze">
            去分析文本
          </Link>
        </div>
      )}
    </ProjectShell>
  );
}

type ModelCardProps = {
  model: Awaited<ReturnType<typeof listUserModels>>[number];
};

function ModelCard({ model }: ModelCardProps) {
  const tags = parseJsonArray(model.tags).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">{model.name}</CardTitle>
        <CardDescription className="line-clamp-3">{model.modelSummary || "暂无摘要"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="text-xs text-zinc-500">
          来源：{model.sourceType || "-"} · {formatDateTime(model.createdAt)}
        </div>
        <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} href={`/models/${model.id}`}>
          查看模型
        </Link>
      </CardContent>
    </Card>
  );
}
