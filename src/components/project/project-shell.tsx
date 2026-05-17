import Link from "next/link";
import { BookOpen, FileText, LayoutDashboard, Plus } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/session";

export function ProjectShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white px-5 py-6 lg:block">
          <div className="text-lg font-semibold text-zinc-950">AI 出书工作台</div>
          <nav className="mt-8 space-y-1 text-sm">
            <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100" href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              控制台
            </Link>
            <Link className="flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-white" href="/projects">
              <BookOpen className="h-4 w-4" />
              项目
            </Link>
            <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100" href="/analyze">
              <FileText className="h-4 w-4" />
              分析
            </Link>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
            <div>
              <p className="text-sm text-zinc-500">当前账号</p>
              <h1 className="text-xl font-semibold text-zinc-950">{user.nickname || user.email}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link className={cn(buttonVariants({ variant: "secondary", size: "sm" }))} href="/projects/new">
                <Plus className="h-4 w-4" />
                新建项目
              </Link>
              <LogoutButton />
            </div>
          </header>
          <div className="flex-1 px-5 py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
