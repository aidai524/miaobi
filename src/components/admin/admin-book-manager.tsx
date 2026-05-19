"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { listPublicAuthors, listPublicBooks } from "@/lib/public-library/service";

type BookItem = Awaited<ReturnType<typeof listPublicBooks>>[number];
type AuthorOption = Awaited<ReturnType<typeof listPublicAuthors>>[number];
type BookFormValue = {
  id?: number;
  title?: string | null;
  subtitle?: string | null;
  authorName?: string | null;
  primaryAuthorId?: number | string | null;
  publisher?: string | null;
  publishDate?: string | null;
  category?: string | null;
  tags?: string | null;
  summary?: string | null;
  tableOfContents?: string | null;
  recommendationReason?: string | null;
  coverUrl?: string | null;
  sourceNote?: string | null;
};

type AdminBookManagerProps = {
  initialBooks: BookItem[];
  authors: AuthorOption[];
};

type BookResponse = {
  book?: BookItem;
  books?: BookItem[];
  count?: number;
};

const emptyBook = {
  title: "",
  subtitle: "",
  authorName: "",
  primaryAuthorId: "",
  publisher: "",
  publishDate: "",
  category: "",
  tags: "",
  summary: "",
  tableOfContents: "",
  recommendationReason: "",
  coverUrl: "",
  sourceNote: "",
};

export function AdminBookManager({ initialBooks, authors }: AdminBookManagerProps) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importText, setImportText] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, bookId?: number) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const payload = payloadFromForm(new FormData(event.currentTarget));
    const response = await fetch(bookId ? `/api/admin/books/${bookId}` : "/api/admin/books", {
      method: bookId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readApiJson<BookResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "保存图书失败"));
      return;
    }

    const book = result.book;
    if (book) {
      setBooks((items) =>
        bookId ? items.map((item) => (item.id === bookId ? book : item)) : [book, ...items],
      );
    }
    setEditingId(null);
    setMessage(bookId ? "图书已更新" : "图书已新增");
    router.refresh();
  }

  async function remove(bookId: number) {
    if (!window.confirm("确定删除这本图书吗？")) {
      return;
    }

    setError("");
    setMessage("");
    const response = await fetch(`/api/admin/books/${bookId}`, { method: "DELETE" });
    const result = await readApiJson<BookResponse>(response);
    if (!response.ok) {
      setError(apiError(result, "删除图书失败"));
      return;
    }

    setBooks((items) => items.filter((item) => item.id !== bookId));
    setMessage("图书已删除");
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
    const response = await fetch("/api/admin/books/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readApiJson<BookResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "导入图书失败"));
      return;
    }

    setBooks((items) => [...(result.books ?? []), ...items]);
    setImportText("");
    setMessage(`已导入 ${result.count ?? 0} 本图书`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">新增图书</h2>
            <p className="mt-1 text-sm text-zinc-500">维护公共图书库的展示资料。</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setEditingId(editingId === "new" ? null : "new")}>
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>
        {editingId === "new" ? (
          <div className="p-5">
            <BookForm
              book={emptyBook}
              authors={authors}
              isSubmitting={isSubmitting}
              onSubmit={(event) => submit(event)}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">JSON 导入</h2>
          <p className="mt-1 text-sm text-zinc-500">支持数组，或包含 books 数组的对象。</p>
        </div>
        <div className="space-y-3 p-5">
          <Textarea
            className="min-h-40 font-mono text-xs"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder='[{"title":"原则","authorName":"瑞·达利欧","category":"商业","tags":"决策,管理"}]'
          />
          <Button type="button" onClick={importJson} disabled={isSubmitting || !importText.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            导入 JSON
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {books.map((book) => (
          <div key={book.id} className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-zinc-950">{book.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {book.authorName || "未知作者"} · {book.category || "未分类"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(book.id)}>
                  <Edit3 className="h-4 w-4" />
                  编辑
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(book.id)}>
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              </div>
            </div>
            {editingId === book.id ? (
              <div className="border-t border-zinc-200 p-5">
                <BookForm book={book} authors={authors} isSubmitting={isSubmitting} onSubmit={(event) => submit(event, book.id)} />
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
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    primaryAuthorId: String(formData.get("primaryAuthorId") ?? ""),
    publisher: String(formData.get("publisher") ?? ""),
    publishDate: String(formData.get("publishDate") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    tableOfContents: String(formData.get("tableOfContents") ?? ""),
    recommendationReason: String(formData.get("recommendationReason") ?? ""),
    coverUrl: String(formData.get("coverUrl") ?? ""),
    sourceNote: String(formData.get("sourceNote") ?? ""),
  };
}

function BookForm({
  book,
  authors,
  isSubmitting,
  onSubmit,
}: {
  book: BookFormValue;
  authors: AuthorOption[];
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="书名" name="title" defaultValue={book.title} required />
        <Field label="副标题" name="subtitle" defaultValue={book.subtitle ?? ""} />
        <Field label="作者显示名" name="authorName" defaultValue={book.authorName ?? ""} />
        <div className="space-y-2">
          <Label htmlFor={`primaryAuthorId-${book.id ?? "new"}`}>主作者</Label>
          <select
            id={`primaryAuthorId-${book.id ?? "new"}`}
            name="primaryAuthorId"
            defaultValue={book.primaryAuthorId ?? ""}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          >
            <option value="">不关联作者</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <Field label="出版社" name="publisher" defaultValue={book.publisher ?? ""} />
        <Field label="出版时间" name="publishDate" defaultValue={book.publishDate ?? ""} />
        <Field label="分类" name="category" defaultValue={book.category ?? ""} />
        <Field label="标签" name="tags" defaultValue={book.tags ?? ""} />
        <Field label="封面 URL" name="coverUrl" defaultValue={book.coverUrl ?? ""} />
        <Field label="来源备注" name="sourceNote" defaultValue={book.sourceNote ?? ""} />
      </div>
      <LongField label="简介" name="summary" defaultValue={book.summary ?? ""} />
      <LongField label="目录" name="tableOfContents" defaultValue={book.tableOfContents ?? ""} />
      <LongField label="推荐理由" name="recommendationReason" defaultValue={book.recommendationReason ?? ""} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        保存图书
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
