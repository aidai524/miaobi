"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

type DocumentItem = {
  id: number;
  originalFilename: string;
  fileType: string | null;
  fileSize: number | null;
  status: string;
  createdAt: string;
};

const analysisTypes = [
  { value: "author_style", label: "分析作者风格" },
  { value: "content_structure", label: "分析内容结构" },
  { value: "book_potential", label: "分析是否适合出书" },
  { value: "writing_model", label: "生成创作模型" },
];

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "-";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AnalyzeClient({ initialDocuments }: { initialDocuments: DocumentItem[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(initialDocuments[0]?.id ?? null);
  const [analysisType, setAnalysisType] = useState("writing_model");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json().catch(() => ({}));
    setIsUploading(false);

    if (!response.ok) {
      setError(result.error ?? "上传成功，但文本解析失败");
      return;
    }

    setDocuments((items) => [result.document, ...items]);
    setSelectedDocumentId(result.document.id);
    router.refresh();
  }

  async function analyze() {
    if (!selectedDocumentId) {
      setError("请先上传或选择一个文档");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    const response = await fetch(`/api/documents/${selectedDocumentId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisType }),
    });
    const result = await response.json().catch(() => ({}));
    setIsAnalyzing(false);

    if (!response.ok) {
      setError(result.error ?? "AI 分析未完成，请重新发起");
      return;
    }

    router.push(`/analyze/${result.analysis.id}`);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-xl font-semibold text-zinc-950">上传文本</h2>
          <p className="mt-1 text-sm text-zinc-500">支持 txt、md、docx、pdf，单文件不超过 50MB。</p>
        </div>
        <div className="space-y-5 p-5">
          <form className="space-y-4" onSubmit={upload}>
            <div className="space-y-2">
              <Label htmlFor="file">文件</Label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".txt,.md,.docx,.pdf"
                className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800"
                required
              />
            </div>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              上传并提取文本
            </Button>
          </form>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-950">已上传文档</h3>
            {documents.length ? (
              <div className="space-y-2">
                {documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setSelectedDocumentId(document.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                      selectedDocumentId === document.id
                        ? "border-zinc-950 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:bg-zinc-50",
                    )}
                  >
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-950">{document.originalFilename}</span>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {document.fileType || "-"} · {formatFileSize(document.fileSize)} · {document.status} ·{" "}
                        {formatDateTime(document.createdAt)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                暂无上传文档
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-xl font-semibold text-zinc-950">AI 分析</h2>
          <p className="mt-1 text-sm text-zinc-500">选择目标后发起分析。</p>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="analysis-type">分析目标</Label>
            <select
              id="analysis-type"
              value={analysisType}
              onChange={(event) => setAnalysisType(event.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-400"
            >
              {analysisTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <Button className="w-full" onClick={analyze} disabled={isAnalyzing || !selectedDocumentId}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            开始分析
          </Button>

          <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} href="/models">
            查看创作模型
          </Link>
        </div>
      </aside>
    </div>
  );
}
