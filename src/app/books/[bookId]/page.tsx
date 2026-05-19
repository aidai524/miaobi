import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { parseId } from "@/lib/http";
import { getPublicBook, splitTextList } from "@/lib/public-library/service";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ bookId: string }>;
};

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
        {children || <span className="text-zinc-400">暂无内容</span>}
      </div>
    </section>
  );
}

export default async function BookDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { bookId } = await params;
  const id = parseId(bookId);
  if (!id) {
    notFound();
  }

  const result = await getPublicBook(id);
  if (!result) {
    notFound();
  }

  const { book, primaryAuthor } = result;
  const tags = splitTextList(book.tags);
  const inspirationParams = new URLSearchParams({
    topic: `${book.title}${book.subtitle ? `：${book.subtitle}` : ""}`,
    bookType: book.category || "参考图书灵感",
    writingStyle: book.recommendationReason || book.summary || "",
  });
  if (book.authorName) {
    inspirationParams.set("targetReader", `喜欢 ${book.authorName} 相关主题的读者`);
  }

  return (
    <ProjectShell user={user}>
      <div className="mb-6">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/books">
          <ArrowLeft className="h-4 w-4" />
          返回图书库
        </Link>
        <p className="text-sm font-medium text-zinc-500">{book.category || "图书详情"}</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{book.title}</h1>
        {book.subtitle ? <p className="mt-2 text-base text-zinc-600">{book.subtitle}</p> : null}
        <p className="mt-2 text-sm text-zinc-500">
          {book.authorName || "未知作者"}
          {book.publisher ? ` · ${book.publisher}` : ""}
          {book.publishDate ? ` · ${book.publishDate}` : ""}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>图书资料</CardTitle>
            <CardDescription>用于快速理解这本书的选题、结构和可借鉴之处。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextBlock title="简介">{book.summary}</TextBlock>
            <TextBlock title="目录">{book.tableOfContents}</TextBlock>
            <TextBlock title="推荐理由">{book.recommendationReason}</TextBlock>
            <TextBlock title="来源备注">{book.sourceNote}</TextBlock>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>灵感操作</CardTitle>
              <CardDescription>用这本书的方向创建一个新的图书项目。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link className={cn(buttonVariants(), "w-full")} href={`/projects/new?${inspirationParams.toString()}`}>
                <Plus className="h-4 w-4" />
                以此为灵感创建新书
              </Link>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "w-full cursor-not-allowed opacity-60")}
                disabled
              >
                <FileText className="h-4 w-4" />
                分析功能后续开放
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-600">
              <Info label="出版社" value={book.publisher} />
              <Info label="出版时间" value={book.publishDate} />
              <Info label="分类" value={book.category} />
              <Info label="主作者" value={primaryAuthor?.name || book.authorName} />
              {tags.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </ProjectShell>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-800">{value || "-"}</span>
    </div>
  );
}
