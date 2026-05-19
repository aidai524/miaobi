import Link from "next/link";
import {
  LogOut,
  PlusCircle,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProjectNavMenu } from "@/components/project/project-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/session";

export function ProjectShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-border-light bg-bg-card lg:flex">
          <div className="flex h-14 items-center gap-2 border-b border-border-light px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              BF
            </div>
            <span className="text-sm font-semibold text-text-primary">BookForge</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm">
            <ProjectNavMenu />
          </nav>
          <div className="border-t border-border-light px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                {(user.nickname || user.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{user.nickname || user.email}</p>
                <p className="truncate text-xs text-text-muted">{user.role === "admin" ? "管理员" : "作者"}</p>
              </div>
              <LogoutButton variant="icon">
                <LogOut className="h-4 w-4 text-text-muted" />
              </LogoutButton>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col lg:ml-60">
          <header className="flex h-14 items-center gap-4 border-b border-border-light bg-bg-card px-6">
            <div>
              <h1 className="text-sm font-semibold text-text-primary">AI 出书工作台</h1>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Link className={cn(buttonVariants({ variant: "secondary", size: "sm" }))} href="/projects/new">
                <PlusCircle className="h-4 w-4" />
                新建项目
              </Link>
              <div className="lg:hidden">
                <LogoutButton />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </section>
      </div>
    </main>
  );
}
