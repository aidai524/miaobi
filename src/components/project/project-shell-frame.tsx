"use client";

import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProjectNavMenu } from "@/components/project/project-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth/session";

const SIDEBAR_COLLAPSED_KEY = "bookforge-sidebar-collapsed";

export function ProjectShellFrame({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-light bg-bg-card transition-[width] duration-200 lg:flex",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <div className={cn("flex h-14 items-center border-b border-border-light", collapsed ? "justify-center px-2" : "gap-2 px-4")}>
            {collapsed ? (
              <Image src="/miaobi-logo-icon.svg" alt="miaobi.pro" width={34} height={34} priority />
            ) : (
              <Image src="/miaobi-logo.svg" alt="miaobi.pro" width={148} height={36} priority />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", collapsed && "absolute left-14 top-3 border border-border-light bg-bg-card shadow-sm")}
              onClick={toggleCollapsed}
              title={collapsed ? "展开导航" : "折叠导航"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
          <nav className={cn("flex-1 overflow-y-auto py-4 text-sm", collapsed ? "px-2" : "px-3")}>
            <ProjectNavMenu collapsed={collapsed} />
          </nav>
          <div className={cn("border-t border-border-light py-3", collapsed ? "px-2" : "px-5")}>
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent"
                title={collapsed ? user.nickname || user.email : undefined}
              >
                {(user.nickname || user.email).slice(0, 1).toUpperCase()}
              </div>
              <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
                <p className="truncate text-sm font-medium text-text-primary">{user.nickname || user.email}</p>
                <p className="truncate text-xs text-text-muted">{user.role === "admin" ? "管理员" : "作者"}</p>
              </div>
              <div className={cn(collapsed && "sr-only")}>
                <LogoutButton variant="icon">
                  <LogOut className="h-4 w-4 text-text-muted" />
                </LogoutButton>
              </div>
            </div>
          </div>
        </aside>

        <section className={cn("flex min-w-0 flex-1 flex-col transition-[margin] duration-200", collapsed ? "lg:ml-16" : "lg:ml-60")}>
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
