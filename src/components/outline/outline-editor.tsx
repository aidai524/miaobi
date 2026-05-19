"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type OutlineTreeNode = {
  id: number;
  projectId: number;
  parentId: number | null;
  level: number;
  sortOrder: number;
  title: string;
  summary: string | null;
  writingGoal: string | null;
  suggestedWordCount: number | null;
  createdAt: string;
  updatedAt: string;
  children: OutlineTreeNode[];
};

type Draft = {
  title: string;
  summary: string;
  writingGoal: string;
  suggestedWordCount: string;
};

type OutlineEditorProps = {
  projectId: number;
  initialTree: OutlineTreeNode[];
};

type OutlineResponse = {
  tree?: OutlineTreeNode[];
  node?: OutlineTreeNode;
};

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

function makeDraft(
  node: Pick<OutlineTreeNode, "title" | "summary" | "writingGoal" | "suggestedWordCount"> | null,
): Draft {
  return {
    title: node?.title ?? "",
    summary: node?.summary ?? "",
    writingGoal: node?.writingGoal ?? "",
    suggestedWordCount: node?.suggestedWordCount ? String(node.suggestedWordCount) : "",
  };
}

function TreeItems({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: OutlineTreeNode[];
  selectedId: number | null;
  onSelect: (node: OutlineTreeNode) => void;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            className={cn(
              "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
              selectedId === node.id ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100",
            )}
            onClick={() => onSelect(node)}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              {node.children.length ? <ChevronRight className="h-4 w-4" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{node.title}</span>
              <span className={cn("mt-0.5 block text-xs", selectedId === node.id ? "text-zinc-300" : "text-zinc-400")}>
                L{node.level} · {node.suggestedWordCount || 0} 字
              </span>
            </span>
          </button>
          {node.children.length ? (
            <div className="ml-4 border-l border-zinc-200 pl-2">
              <TreeItems nodes={node.children} selectedId={selectedId} onSelect={onSelect} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function OutlineEditor({ projectId, initialTree }: OutlineEditorProps) {
  const router = useRouter();
  const flatNodes = useMemo(() => flattenTree(initialTree), [initialTree]);
  const [selectedId, setSelectedId] = useState<number | null>(flatNodes[0]?.id ?? null);
  const selectedNode = flatNodes.find((node) => node.id === selectedId) ?? flatNodes[0] ?? null;
  const [draft, setDraft] = useState<Draft>(() => makeDraft(selectedNode));
  const [draftNodeId, setDraftNodeId] = useState<number | null>(selectedNode?.id ?? null);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const visibleDraft = selectedNode && draftNodeId !== selectedNode.id ? makeDraft(selectedNode) : draft;

  function selectNode(node: OutlineTreeNode) {
    setSelectedId(node.id);
    setDraftNodeId(node.id);
    setDraft(makeDraft(node));
  }

  async function request(path: string, options: RequestInit) {
    setError("");
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const result = await readApiJson<OutlineResponse>(response);

    if (!response.ok) {
      throw new Error(apiError(result, "操作失败，请稍后重试"));
    }

    return result;
  }

  async function runAction(action: string, task: () => Promise<void>) {
    setBusyAction(action);
    try {
      await task();
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "操作失败，请稍后重试");
    } finally {
      setBusyAction(null);
    }
  }

  async function generateOutline() {
    await runAction("generate", async () => {
      const result = await request(`/api/projects/${projectId}/generate-outline`, { method: "POST" });
      const first = flattenTree(result.tree ?? [])[0];
      setSelectedId(first?.id ?? null);
    });
  }

  async function saveNode() {
    if (!selectedNode) {
      return;
    }

    await runAction("save", async () => {
      await request(`/api/outline/nodes/${selectedNode.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: visibleDraft.title,
          summary: visibleDraft.summary,
          writingGoal: visibleDraft.writingGoal,
          suggestedWordCount: visibleDraft.suggestedWordCount,
        }),
      });
    });
  }

  async function addNode(parentId: number | null, title: string) {
    await runAction("add", async () => {
      const result = await request(`/api/projects/${projectId}/outline`, {
        method: "POST",
        body: JSON.stringify({
          parentId,
          title,
          summary: "",
          writingGoal: "",
          suggestedWordCount: null,
        }),
      });
      if (result.node) {
        setSelectedId(result.node.id);
        setDraftNodeId(result.node.id);
        setDraft(makeDraft(result.node));
      }
    });
  }

  async function deleteNode() {
    if (!selectedNode) {
      return;
    }

    const ok = window.confirm("删除该节点及其子节点？");
    if (!ok) {
      return;
    }

    await runAction("delete", async () => {
      await request(`/api/outline/nodes/${selectedNode.id}`, { method: "DELETE" });
      setSelectedId(null);
    });
  }

  const isBusy = Boolean(busyAction);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">目录树</h3>
            <p className="text-xs text-zinc-500">{flatNodes.length} 个节点</p>
          </div>
          <Button size="sm" onClick={generateOutline} disabled={isBusy}>
            {busyAction === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            生成目录
          </Button>
        </div>
        <div className="max-h-[720px] overflow-auto p-3">
          {initialTree.length ? (
            <TreeItems nodes={initialTree} selectedId={selectedNode?.id ?? null} onSelect={selectNode} />
          ) : (
            <div className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
              暂无目录
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">节点详情</h3>
            <p className="text-xs text-zinc-500">{selectedNode ? `Level ${selectedNode.level}` : "未选择节点"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(selectedNode?.parentId ?? null, "新目录节点")}
              disabled={isBusy}
            >
              <Plus className="h-4 w-4" />
              新增同级节点
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedNode && addNode(selectedNode.id, "新子节点")}
              disabled={isBusy || !selectedNode || selectedNode.level >= 3}
            >
              <Plus className="h-4 w-4" />
              新增子节点
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteNode} disabled={isBusy || !selectedNode}>
              <Trash2 className="h-4 w-4" />
              删除节点
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {selectedNode ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="outline-title">标题</Label>
                <Input
                  id="outline-title"
                  value={visibleDraft.title}
                  onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outline-summary">摘要</Label>
                <Textarea
                  id="outline-summary"
                  value={visibleDraft.summary}
                  onChange={(event) => setDraft((value) => ({ ...value, summary: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outline-goal">写作目标</Label>
                <Textarea
                  id="outline-goal"
                  value={visibleDraft.writingGoal}
                  onChange={(event) => setDraft((value) => ({ ...value, writingGoal: event.target.value }))}
                />
              </div>

              <div className="max-w-xs space-y-2">
                <Label htmlFor="outline-word-count">建议字数</Label>
                <Input
                  id="outline-word-count"
                  type="number"
                  min="1"
                  value={visibleDraft.suggestedWordCount}
                  onChange={(event) => setDraft((value) => ({ ...value, suggestedWordCount: event.target.value }))}
                />
              </div>

              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

              <Button onClick={saveNode} disabled={isBusy || !visibleDraft.title.trim()}>
                {busyAction === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存修改
              </Button>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              选择或生成一个目录节点
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
