"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { listPublicAuthors } from "@/lib/public-library/service";

type AuthorItem = Awaited<ReturnType<typeof listPublicAuthors>>[number];
type AuthorFormValue = Partial<AuthorItem> & Partial<Record<keyof typeof emptyAuthor, string | null>>;

type AdminAuthorManagerProps = {
  initialAuthors: AuthorItem[];
};

type AuthorResponse = {
  author?: AuthorItem;
  authors?: AuthorItem[];
  count?: number;
};

const emptyAuthor = {
  name: "",
  bio: "",
  mainFields: "",
  representativeBooks: "",
  writingTraits: "",
  tags: "",
};

export function AdminAuthorManager({ initialAuthors }: AdminAuthorManagerProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importText, setImportText] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, authorId?: number) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const payload = payloadFromForm(new FormData(event.currentTarget));
    const response = await fetch(authorId ? `/api/admin/authors/${authorId}` : "/api/admin/authors", {
      method: authorId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readApiJson<AuthorResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "保存作者失败"));
      return;
    }

    const author = result.author;
    if (author) {
      setAuthors((items) =>
        authorId ? items.map((item) => (item.id === authorId ? author : item)) : [author, ...items],
      );
    }
    setEditingId(null);
    setMessage(authorId ? "作者已更新" : "作者已新增");
    router.refresh();
  }

  async function remove(authorId: number) {
    if (!window.confirm("确定删除这位作者吗？")) {
      return;
    }

    setError("");
    setMessage("");
    const response = await fetch(`/api/admin/authors/${authorId}`, { method: "DELETE" });
    const result = await readApiJson<AuthorResponse>(response);
    if (!response.ok) {
      setError(apiError(result, "删除作者失败"));
      return;
    }

    setAuthors((items) => items.filter((item) => item.id !== authorId));
    setMessage("作者已删除");
    router.refresh();
  }

  async function importJson() {
    setError("");
    setMessage("");

    let payload: unknown;
    try {
      payload = JSON.parse(importText);
    } catch {
      setError("JSON 格式无效");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/admin/authors/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readApiJson<AuthorResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "导入作者失败"));
      return;
    }

    setAuthors((items) => [...(result.authors ?? []), ...items]);
    setImportText("");
    setMessage(`已导入 ${result.count ?? 0} 位作者`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">新增作者</h2>
            <p className="mt-1 text-sm text-zinc-500">维护作者领域、代表作和写作风格。</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setEditingId(editingId === "new" ? null : "new")}>
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>
        {editingId === "new" ? (
          <div className="p-5">
            <AuthorForm author={emptyAuthor} isSubmitting={isSubmitting} onSubmit={(event) => submit(event)} />
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">JSON 导入</h2>
          <p className="mt-1 text-sm text-zinc-500">支持数组，或包含 authors 数组的对象。</p>
        </div>
        <div className="space-y-3 p-5">
          <Textarea
            className="min-h-40 font-mono text-xs"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder='[{"name":"彼得·德鲁克","mainFields":"管理,商业","representativeBooks":"卓有成效的管理者"}]'
          />
          <Button type="button" onClick={importJson} disabled={isSubmitting || !importText.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            导入 JSON
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {authors.map((author) => (
          <div key={author.id} className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-zinc-950">{author.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{author.mainFields || "暂无领域信息"}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(author.id)}>
                  <Edit3 className="h-4 w-4" />
                  编辑
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(author.id)}>
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              </div>
            </div>
            {editingId === author.id ? (
              <div className="border-t border-zinc-200 p-5">
                <AuthorForm author={author} isSubmitting={isSubmitting} onSubmit={(event) => submit(event, author.id)} />
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}

function payloadFromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    mainFields: String(formData.get("mainFields") ?? ""),
    representativeBooks: String(formData.get("representativeBooks") ?? ""),
    writingTraits: String(formData.get("writingTraits") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  };
}

function AuthorForm({
  author,
  isSubmitting,
  onSubmit,
}: {
  author: AuthorFormValue;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="作者姓名" name="name" defaultValue={author.name} required />
        <Field label="领域" name="mainFields" defaultValue={author.mainFields} />
        <Field label="代表书" name="representativeBooks" defaultValue={author.representativeBooks} />
        <Field label="风格标签" name="tags" defaultValue={author.tags} />
      </div>
      <LongField label="作者简介" name="bio" defaultValue={author.bio} />
      <LongField label="写作特征" name="writingTraits" defaultValue={author.writingTraits} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        保存作者
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

function LongField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue ?? ""} className="min-h-28" />
    </div>
  );
}
