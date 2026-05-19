import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AdminAuthorManager } from "@/components/admin/admin-author-manager";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listPublicAuthors } from "@/lib/public-library/service";
import { cn } from "@/lib/utils";

export default async function AdminAuthorsPage() {
  const user = await requireAdmin();
  const authors = await listPublicAuthors();

  return (
    <ProjectShell user={user}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/authors">
            <ArrowLeft className="h-4 w-4" />
            返回作者库
          </Link>
          <p className="text-sm font-medium text-zinc-500">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">作者后台</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            维护公共作者资料，也可以批量导入 JSON。
          </p>
        </div>
        <Link className={cn(buttonVariants({ variant: "outline" }))} href="/admin/books">
          <BookOpen className="h-4 w-4" />
          管理图书
        </Link>
      </div>

      <AdminAuthorManager initialAuthors={authors} />
    </ProjectShell>
  );
}
