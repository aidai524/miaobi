import Link from "next/link";
import { PenLine, Plus, UserRound } from "lucide-react";
import { AuthorFilters } from "@/components/public-library/author-filters";
import { ProjectShell } from "@/components/project/project-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { listPublicAuthorFields, listPublicAuthors, splitTextList } from "@/lib/public-library/service";
import { publicAuthorQuerySchema } from "@/lib/public-library/validation";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<{ q?: string; field?: string }>;
};

export default async function AuthorsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const query = publicAuthorQuerySchema.parse(params);
  const [authors, fields] = await Promise.all([listPublicAuthors(query), listPublicAuthorFields()]);

  return (
    <ProjectShell user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">作者库</h2>
            <p className="mt-1 text-sm text-text-muted">查看作者领域、代表作和风格标签</p>
          </div>
          {user.role === "admin" ? (
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/admin/authors">
              <Plus className="h-4 w-4" />
              管理作者
            </Link>
          ) : null}
        </div>

        <AuthorFilters fields={fields} defaults={query} />

        {authors.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {authors.map((author) => {
              const tags = splitTextList(author.tags || author.writingTraits).slice(0, 4);
              return (
                <Card key={author.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light">
                      <UserRound className="h-4 w-4 text-accent" />
                    </div>
                    <CardTitle>{author.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{author.mainFields || "暂无领域信息"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 text-sm leading-6 text-text-secondary">{author.bio || "暂无作者简介"}</p>
                    <div className="rounded-xl bg-bg-secondary p-3 text-sm leading-6 text-text-secondary">
                      <span className="font-medium text-text-primary">代表书：</span>
                      {author.representativeBooks || "-"}
                    </div>
                    {tags.length ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <PenLine className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-sm text-text-muted">没有找到匹配的作者</p>
          </div>
        )}
      </div>
    </ProjectShell>
  );
}
