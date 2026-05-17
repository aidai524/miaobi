import { AnalyzeClient } from "@/components/analyze/analyze-client";
import { ProjectShell } from "@/components/project/project-shell";
import { requireUser } from "@/lib/auth/session";
import { listUserDocuments } from "@/lib/analysis/service";

export default async function AnalyzePage() {
  const user = await requireUser();
  const documents = await listUserDocuments(user.id);

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Analyze</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">文本分析</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          上传资料，提取内容结构、表达风格、可复用创作特征，并为后续创作模型做准备。
        </p>
      </div>
      <AnalyzeClient initialDocuments={documents} />
    </ProjectShell>
  );
}
