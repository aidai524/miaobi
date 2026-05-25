"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileClock,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownChapterEditor } from "@/components/studio/markdown-chapter-editor";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type OutlineTreeNode = {
  id: number;
  parentId: number | null;
  level: number;
  sortOrder: number;
  title: string;
  summary: string | null;
  writingGoal: string | null;
  suggestedWordCount: number | null;
  children: OutlineTreeNode[];
};

type ChapterItem = {
  id: number;
  projectId: number;
  outlineNodeId: number;
  title: string;
  content: string | null;
  status: string;
  wordCount: number;
  updatedAt: string;
  outlineNode: Omit<OutlineTreeNode, "children">;
};

type ChapterVersion = {
  id: number;
  chapterId: number;
  versionNo: number;
  content: string;
  createdBy: string;
  createdAt: string;
};

type ChapterStudioProps = {
  outlineTree: OutlineTreeNode[];
  initialChapters: ChapterItem[];
  initialVersions: ChapterVersion[];
};

type ChapterResponse = {
  chapter?: ChapterItem;
  versions?: ChapterVersion[];
};

type GenerateStreamEvent =
  | { event: "chunk"; data: { content?: string } }
  | { event: "done"; data: { chapter?: ChapterItem } }
  | { event: "error"; data: { error?: string } };

const rewriteActions = [
  { action: "expand", label: "扩写" },
  { action: "shorten", label: "精简" },
  { action: "plain", label: "更通俗" },
  { action: "professional", label: "更专业" },
  { action: "add_case", label: "增加案例" },
  { action: "summary", label: "生成小结" },
  { action: "quote", label: "生成金句" },
] as const;

function flattenTree(nodes: OutlineTreeNode[]) {
  const result: OutlineTreeNode[] = [];

  function walk(items: OutlineTreeNode[]) {
    for (const item of items) {
      result.push(item);
      walk(item.children);
    }
  }

  walk(nodes);
  return result;
}

function TreeItems({
  nodes,
  chapterByNodeId,
  selectedChapterId,
  onSelect,
}: {
  nodes: OutlineTreeNode[];
  chapterByNodeId: Map<number, ChapterItem>;
  selectedChapterId: number | null;
  onSelect: (chapter: ChapterItem) => void;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const chapter = chapterByNodeId.get(node.id);
        const isSelected = chapter?.id === selectedChapterId;

        return (
          <li key={node.id}>
            <button
              type="button"
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                isSelected ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100",
              )}
              onClick={() => chapter && onSelect(chapter)}
            >
              <span className="block truncate font-medium">{node.title}</span>
              <span className={cn("mt-0.5 block text-xs", isSelected ? "text-zinc-300" : "text-zinc-400")}>
                L{node.level} · {chapter?.wordCount ?? 0} 字
              </span>
            </button>
            {node.children.length ? (
              <div className="ml-4 border-l border-zinc-200 pl-2">
                <TreeItems
                  nodes={node.children}
                  chapterByNodeId={chapterByNodeId}
                  selectedChapterId={selectedChapterId}
                  onSelect={onSelect}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function parseGenerateStreamEvent(block: string): GenerateStreamEvent | null {
  const event = block.match(/^event:\s*(.+)$/m)?.[1]?.trim();
  const data = block.match(/^data:\s*(.+)$/m)?.[1]?.trim();
  if (!event || !data) {
    return null;
  }

  try {
    return { event, data: JSON.parse(data) } as GenerateStreamEvent;
  } catch {
    return null;
  }
}

export function ChapterStudio({ outlineTree, initialChapters, initialVersions }: ChapterStudioProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const flatNodes = useMemo(() => flattenTree(outlineTree), [outlineTree]);
  const chapterByNodeId = useMemo(
    () => new Map(chapters.map((chapter) => [chapter.outlineNodeId, chapter])),
    [chapters],
  );
  const firstChapter = flatNodes.map((node) => chapterByNodeId.get(node.id)).find(Boolean) ?? chapters[0] ?? null;
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(firstChapter?.id ?? null);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? firstChapter;
  const [title, setTitle] = useState(selectedChapter?.title ?? "");
  const [content, setContent] = useState(selectedChapter?.content ?? "");
  const [versions, setVersions] = useState<ChapterVersion[]>(initialVersions);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  function selectChapter(chapter: ChapterItem) {
    setSelectedChapterId(chapter.id);
    setTitle(chapter.title);
    setContent(chapter.content ?? "");
    setError("");
    loadVersions(chapter.id).catch(() => setVersions([]));
  }

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const result = await readApiJson<ChapterResponse>(response);

    if (!response.ok) {
      throw new Error(apiError(result, "操作失败，请稍后重试"));
    }

    return result;
  }

  function updateChapterState(chapter: ChapterItem) {
    setChapters((items) => items.map((item) => (item.id === chapter.id ? { ...item, ...chapter } : item)));
    setSelectedChapterId(chapter.id);
    setTitle(chapter.title);
    setContent(chapter.content ?? "");
  }

  async function loadVersions(chapterId: number) {
    const result = await request(`/api/chapters/${chapterId}/versions`);
    setVersions(result.versions ?? []);
  }

  async function runAction(action: string, task: () => Promise<void>) {
    setBusyAction(action);
    setError("");
    try {
      await task();
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "操作失败，请稍后重试");
    } finally {
      setBusyAction(null);
    }
  }

  async function save(createVersion: boolean) {
    if (!selectedChapter) {
      return;
    }

    await runAction(createVersion ? "save-version" : "save", async () => {
      const result = await request(`/api/chapters/${selectedChapter.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, content, createVersion }),
      });
      if (result.chapter) {
        updateChapterState(result.chapter);
      }
      await loadVersions(selectedChapter.id);
    });
  }

  async function generate() {
    if (!selectedChapter) {
      return;
    }

    await runAction("generate", async () => {
      const result = await streamGeneratedChapter(selectedChapter.id);
      updateChapterState(result);
      await loadVersions(selectedChapter.id);
    });
  }

  async function streamGeneratedChapter(chapterId: number) {
    const response = await fetch(`/api/chapters/${chapterId}/generate`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
      },
    });

    if (!response.ok || !response.body) {
      const result = await readApiJson<ChapterResponse>(response);
      throw new Error(apiError(result, "生成正文失败，请稍后重试"));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamedContent = "";
    let updatedChapter: ChapterItem | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\n\n/);
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        const event = parseGenerateStreamEvent(eventBlock);
        if (!event) {
          continue;
        }

        if (event.event === "chunk") {
          const chunk = event.data.content ?? "";
          streamedContent += chunk;
          setContent(streamedContent);
        }

        if (event.event === "done" && event.data.chapter) {
          updatedChapter = event.data.chapter;
        }

        if (event.event === "error") {
          throw new Error(event.data.error || "生成正文失败，请稍后重试");
        }
      }
    }

    if (!updatedChapter) {
      throw new Error("生成正文未完成，请稍后重试");
    }

    return updatedChapter;
  }

  async function rewrite(action: string) {
    if (!selectedChapter) {
      return;
    }

    await runAction(`rewrite:${action}`, async () => {
      const result = await request(`/api/chapters/${selectedChapter.id}/rewrite`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (result.chapter) {
        updateChapterState(result.chapter);
      }
      await loadVersions(selectedChapter.id);
    });
  }

  async function restore(versionId: number) {
    if (!selectedChapter) {
      return;
    }

    await runAction(`restore:${versionId}`, async () => {
      const result = await request(`/api/chapters/${selectedChapter.id}/restore-version`, {
        method: "POST",
        body: JSON.stringify({ versionId }),
      });
      if (result.chapter) {
        updateChapterState(result.chapter);
      }
      await loadVersions(selectedChapter.id);
    });
  }

  const isBusy = Boolean(busyAction);
  const studioGridClass = cn(
    "grid gap-4",
    outlineCollapsed && assistantCollapsed
      ? "xl:grid-cols-[minmax(0,1fr)]"
      : outlineCollapsed
        ? "xl:grid-cols-[minmax(0,1fr)_320px]"
        : assistantCollapsed
          ? "xl:grid-cols-[300px_minmax(0,1fr)]"
          : "xl:grid-cols-[300px_minmax(0,1fr)_320px]",
  );

  return (
    <div className={studioGridClass}>
      {outlineCollapsed ? null : (
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">目录</h3>
              <p className="text-xs text-zinc-500">{chapters.length} 个正文节点</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setOutlineCollapsed(true)}
              title="收起目录"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[760px] overflow-auto p-3">
            <TreeItems
              nodes={outlineTree}
              chapterByNodeId={chapterByNodeId}
              selectedChapterId={selectedChapter?.id ?? null}
              onSelect={selectChapter}
            />
          </div>
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">正文编辑</h3>
              <p className="text-xs text-zinc-500">
                {selectedChapter ? `${selectedChapter.wordCount} 字 · ${formatDateTime(selectedChapter.updatedAt)}` : "未选择章节"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {outlineCollapsed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOutlineCollapsed(false)}
                  title="展开目录"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  目录
                </Button>
              ) : null}
              {assistantCollapsed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssistantCollapsed(false)}
                  title="展开 AI 助手"
                >
                  <PanelRightOpen className="h-4 w-4" />
                  AI 助手
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => save(false)} disabled={isBusy || !selectedChapter}>
                {busyAction === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存正文
              </Button>
              <Button size="sm" onClick={() => save(true)} disabled={isBusy || !selectedChapter}>
                {busyAction === "save-version" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileClock className="h-4 w-4" />
                )}
                保存版本
              </Button>
            </div>
          </div>
        </div>

        {selectedChapter ? (
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">标题</Label>
              <Input id="chapter-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-content">正文</Label>
              <MarkdownChapterEditor
                id="chapter-content"
                value={content}
                onChange={setContent}
              />
            </div>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-zinc-500">请先选择目录节点</div>
        )}
      </section>

      {assistantCollapsed ? null : (
        <aside className="space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-950">AI 助手</h3>
                <p className="text-xs text-zinc-500">生成或改写当前正文</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setAssistantCollapsed(true)}
                title="收起 AI 助手"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 p-4">
              <Button className="w-full" onClick={generate} disabled={isBusy || !selectedChapter}>
                {busyAction === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                生成正文
              </Button>
              <div className="grid grid-cols-2 gap-2">
                {rewriteActions.map((item) => (
                  <Button
                    key={item.action}
                    variant="outline"
                    size="sm"
                    onClick={() => rewrite(item.action)}
                    disabled={isBusy || !selectedChapter || !selectedChapter.content?.trim()}
                  >
                    {busyAction === `rewrite:${item.action}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h3 className="text-base font-semibold text-zinc-950">版本历史</h3>
              <p className="text-xs text-zinc-500">{versions.length} 个版本</p>
            </div>
            <div className="max-h-[480px] space-y-3 overflow-auto p-4">
              {versions.length ? (
                versions.map((version) => (
                  <div key={version.id} className="rounded-md border border-zinc-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-950">版本 {version.versionNo}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {version.createdBy} · {formatDateTime(version.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restore(version.id)}
                        disabled={isBusy || !selectedChapter}
                        title="恢复此版本"
                      >
                        {busyAction === `restore:${version.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{version.content}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
                  暂无版本
                </p>
              )}
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}
