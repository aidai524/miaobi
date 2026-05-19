import Link from "next/link";
import { Library, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookFilters } from "@/components/public-library/book-filters";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { listPublicBookCategories, listPublicBooks, splitTextList } from "@/lib/public-library/service";
import { publicBookQuerySchema } from "@/lib/public-library/validation";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<{ q?: string; author?: string; category?: string }>;
};

export default async function BooksPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const query = publicBookQuerySchema.parse(params);
  const [books, categories] = await Promise.all([listPublicBooks(query), listPublicBookCategories()]);

  return (
    <ProjectShell user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">图书库</h2>
            <p className="mt-1 text-sm text-text-muted">浏览优秀图书，获取结构与表达灵感</p>
          </div>
          {user.role === "admin" ? (
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/admin/books">
              <Plus className="h-4 w-4" />
              管理图书
            </Link>
          ) : null}
        </div>

        <BookFilters categories={categories} defaults={query} />

        {books.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => {
              const tags = splitTextList(book.tags).slice(0, 3);
              return (
                <Card key={book.id} className="transition-shadow hover:shadow-md">
                  <CardContent>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{book.title}</h3>
                        <p className="mt-1 text-xs text-text-secondary">
                          {book.authorName || "未知作者"}
                          {book.publisher ? ` · ${book.publisher}` : ""}
                          {book.publishDate ? ` · ${book.publishDate}` : ""}
                        </p>
                      </div>
                      {book.category ? (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {book.category}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs leading-5 text-text-muted">{book.summary || "暂无简介"}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0")} href={`/books/${book.id}`}>
                        查看详情
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Library className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-sm text-text-muted">没有找到匹配的图书</p>
          </div>
        )}
      </div>
    </ProjectShell>
  );
}
