"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProjectExport = {
  format: "markdown" | "word";
  filename: string;
  downloadUrl: string;
  wordCount: number;
  chapterCount: number;
  generatedAt: string;
};

type ProjectExportResponse = {
  export?: ProjectExport;
};

export function ProjectExportClient({ projectId }: { projectId: number }) {
  const [exported, setExported] = useState<ProjectExport | null>(null);
  const [error, setError] = useState("");
  const [exportingFormat, setExportingFormat] = useState<ProjectExport["format"] | null>(null);

  async function exportFile(format: ProjectExport["format"]) {
    setError("");
    setExportingFormat(format);
    const response = await fetch(`/api/projects/${projectId}/export/${format === "word" ? "word" : "markdown"}`);
    const result = await readApiJson<ProjectExportResponse>(response);
    setExportingFormat(null);

    if (!response.ok) {
      setError(apiError(result, "导出失败，请稍后重试"));
      return;
    }

    if (result.export) {
      setExported(result.export);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => exportFile("markdown")} disabled={Boolean(exportingFormat)}>
          {exportingFormat === "markdown" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        生成 Markdown
        </Button>
        <Button type="button" variant="secondary" onClick={() => exportFile("word")} disabled={Boolean(exportingFormat)}>
          {exportingFormat === "word" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          生成 Word
        </Button>
      </div>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {exported ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-base font-semibold text-zinc-950">导出完成</h3>
          <dl className="mt-3 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
            <div>
              <dt className="text-zinc-500">格式</dt>
              <dd className="mt-1 font-medium text-zinc-900">{exported.format === "word" ? "Word" : "Markdown"}</dd>
            </div>
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
              <dt className="text-zinc-500">导出字数</dt>
              <dd className="mt-1 font-medium text-zinc-900">{exported.wordCount}</dd>
            </div>
          </dl>
          <a className={cn(buttonVariants({ variant: "outline" }), "mt-4")} href={exported.downloadUrl}>
            <Download className="h-4 w-4" />
            下载 {exported.format === "word" ? "Word" : "Markdown"}
          </a>
        </div>
      ) : null}
    </div>
  );
}
