import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileSearch,
  Brain,
  Library,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: BookOpen, label: "我的书籍" },
  { to: "/create", icon: PlusCircle, label: "创建新书" },
  { to: "/analyze", icon: FileSearch, label: "文本分析" },
  { to: "/models", icon: Brain, label: "我的模型" },
  { to: "/library", icon: Library, label: "图书库" },
  { to: "/authors", icon: Users, label: "作者库" },
  { to: "/settings", icon: Settings, label: "设置" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border-light bg-bg-card">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-border-light">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
          BF
        </div>
        <span className="font-semibold text-text-primary text-sm">
          BookForge
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent text-xs font-semibold">
          Z
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            张明远
          </p>
          <p className="text-xs text-text-muted truncate">作者</p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <LogOut className="h-4 w-4 text-text-muted" />
        </Button>
      </div>
    </aside>
  );
}
