import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { ProjectCreateForm } from "@/components/project/project-create-form";
import { ProjectShell } from "@/components/project/project-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { listUserModels } from "@/lib/models/service";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<{
    modelId?: string;
    topic?: string;
    targetReader?: string;
    bookType?: string;
    writingStyle?: string;
  }>;
};

export default async function NewProjectPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const models = await listUserModels(user.id);
  const params = searchParams ? await searchParams : {};
  const selectedModelId = Number(params.modelId);
  const defaultReferenceModelId = models.some((model) => model.id === selectedModelId) ? selectedModelId : undefined;
  const defaults = {
    topic: params.topic,
    targetReader: params.targetReader,
    bookType: params.bookType,
    writingStyle: params.writingStyle,
  };

  return (
    <ProjectShell user={user}>
      <div className="mx-auto max-w-5xl p-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/projects">
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-text-primary">定义你的图书需求</h2>
              <p className="text-sm text-text-muted">写下你的核心主题，AI 将为你生成完整的图书策划案。</p>
            </div>

            <ProjectCreateForm
              models={models.map((model) => ({ id: model.id, name: model.name }))}
              defaultReferenceModelId={defaultReferenceModelId}
              defaults={defaults}
            />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  什么样的主题适合开始
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-text-secondary">
                <p>一个好的主题具备三个特征：你有独特经验或观点、有明确目标读者群、能解决一个具体问题。</p>
                <p>不需要已经写完全文，只需要一个清晰方向。AI 会帮你完成从定位到目录的全过程。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>下一步会发生什么</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-text-secondary">
                <p>1. 生成结构化图书策划案</p>
                <p>2. 基于策划案生成三级目录</p>
                <p>3. 进入正文工作台逐章写作</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProjectShell>
  );
}
