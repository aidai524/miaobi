"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[560px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
      正在加载编辑器...
    </div>
  ),
});

export function MarkdownChapterEditor({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id} className="chapter-markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        height={560}
        preview="edit"
        textareaProps={{
          placeholder: "点击右侧生成正文，或直接开始写作。",
        }}
        previewOptions={{
          className: "chapter-markdown-preview",
        }}
      />
    </div>
  );
}
