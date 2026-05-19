"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type MarkdownExport = {
  filename: string;
  downloadUrl: string;
  wordCount: number;
  chapterCount: number;
  generatedAt: string;
};

type MarkdownExportResponse = {
  export?: MarkdownExport;
};

export function MarkdownExportClient({ projectId }: { projectId: number }) {
  const [exported, setExported] = useState<MarkdownExport | null>(null);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  async function exportMarkdown() {
    setError("");
    setIsExporting(true);
    const response = await fetch(`/api/projects/${projectId}/export/markdown`);
    const result = await readApiJson<MarkdownExportResponse>(response);
    setIsExporting(false);

    if (!response.ok) {
      setError(apiError(result, "导出 Markdown 失败，请稍后重试"));
      return;
    }

    if (result.export) {
      setExported(result.export);
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={exportMarkdown} disabled={isExporting}>
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        生成 Markdown
      </Button>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {exported ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-base font-semibold text-zinc-950">导出完成</h3>
          <dl className="mt-3 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
            <div>
              <dt className="text-zinc-500">文件名</dt>
              <dd className="mt-1 break-all font-medium text-zinc-900">{exported.filename}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">生成时间</dt>
              <dd className="mt-1 font-medium text-zinc-900">{formatDateTime(exported.generatedAt)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">正文节点</dt>
              <dd className="mt-1 font-medium text-zinc-900">{exported.chapterCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Markdown 字符数</dt>
              <dd className="mt-1 font-medium text-zinc-900">{exported.wordCount}</dd>
            </div>
          </dl>
          <a className={cn(buttonVariants({ variant: "outline" }), "mt-4")} href={exported.downloadUrl}>
            <Download className="h-4 w-4" />
            下载 Markdown
          </a>
        </div>
      ) : null}
    </div>
  );
}
