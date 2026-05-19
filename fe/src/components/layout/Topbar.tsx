import { useLocation } from "react-router-dom";
import { Save, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title?: string;
  projectName?: string;
  showSearch?: boolean;
  saveStatus?: "saved" | "saving" | "error" | null;
  showExport?: boolean;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "我的书籍",
  "/create": "创建新书",
  "/analyze": "文本分析",
  "/models": "我的模型",
  "/library": "图书库",
  "/authors": "作者库",
  "/settings": "设置",
};

export function Topbar({
  title,
  projectName,
  showSearch,
  saveStatus,
  showExport,
}: TopbarProps) {
  const location = useLocation();

  const getPageTitle = () => {
    if (title) return title;
    for (const [path, label] of Object.entries(pageTitles)) {
      if (location.pathname === path) return label;
      if (path !== "/" && location.pathname.startsWith(path)) return label;
    }
    return "";
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border-light bg-bg-card px-6">
      <h1 className="text-sm font-semibold text-text-primary">
        {getPageTitle()}
      </h1>

      {projectName && (
        <>
          <span className="text-text-muted text-sm">/</span>
          <span className="text-sm text-text-secondary">{projectName}</span>
        </>
      )}

      <div className="flex-1" />

      {saveStatus && (
        <div className="flex items-center gap-1.5">
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success font-medium">已保存</span>
            </>
          )}
          {saveStatus === "saving" && (
            <>
              <Clock className="h-3.5 w-3.5 text-warning animate-spin" />
              <span className="text-xs text-warning font-medium">保存中</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-danger" />
              <span className="text-xs text-danger font-medium">保存失败</span>
            </>
          )}
        </div>
      )}

      {showExport && (
        <button className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary transition-colors cursor-pointer">
          <Download className="h-3.5 w-3.5" />
          导出
        </button>
      )}
    </header>
  );
}
