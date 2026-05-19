import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { AdminBookManager } from "@/components/admin/admin-book-manager";
import { ProjectShell } from "@/components/project/project-shell";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listPublicAuthors, listPublicBooks } from "@/lib/public-library/service";
import { cn } from "@/lib/utils";

export default async function AdminBooksPage() {
  const user = await requireAdmin();
  const [books, authors] = await Promise.all([listPublicBooks(), listPublicAuthors()]);

  return (
    <ProjectShell user={user}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mb-3")} href="/books">
            <ArrowLeft className="h-4 w-4" />
            返回图书库
          </Link>
          <p className="text-sm font-medium text-zinc-500">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">图书后台</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            新增、编辑、删除公共图书资料，也可以批量导入 JSON。
          </p>
        </div>
        <Link className={cn(buttonVariants({ variant: "outline" }))} href="/admin/authors">
          <PenLine className="h-4 w-4" />
          管理作者
        </Link>
      </div>

      <AdminBookManager initialBooks={books} authors={authors} />
    </ProjectShell>
  );
}
