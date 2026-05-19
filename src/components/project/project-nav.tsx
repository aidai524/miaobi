"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileSearch,
  LayoutDashboard,
  Library,
  PlusCircle,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export function ProjectNav({ items }: { items: ProjectNavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <li key={`${item.href}-${item.label}`}>
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors",
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
              )}
              href={item.href}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const baseNavItems: ProjectNavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: BookOpen, label: "我的书籍" },
  { href: "/projects/new", icon: PlusCircle, label: "创建新书" },
  { href: "/analyze", icon: FileSearch, label: "文本分析" },
  { href: "/models", icon: Sparkles, label: "我的模型" },
  { href: "/books", icon: Library, label: "图书库" },
  { href: "/authors", icon: Users, label: "作者库" },
];

export function ProjectNavMenu() {
  return <ProjectNav items={baseNavItems} />;
}
