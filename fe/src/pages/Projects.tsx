import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  MoreHorizontal,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  recentProjects,
  stageLabels,
  stageColors,
} from "@/data/mock";

const allProjects = [
  ...recentProjects,
  {
    id: "4",
    title: "从零构建你的知识体系",
    topic: "学习方法",
    stage: "draft_complete" as const,
    lastEdited: "1 周前",
    completedChapters: 6,
    totalChapters: 6,
  },
];

export default function Projects() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">我的书籍</h2>
          <p className="text-sm text-text-muted mt-1">
            管理所有书籍项目，继续编辑或创建新书
          </p>
        </div>
        <Button onClick={() => navigate("/create")}>
          <Plus className="h-4 w-4" />
          创建新书
        </Button>
      </div>

      {allProjects.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm mb-4">还没有书籍项目</p>
          <Button onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4" />
            创建第一本书
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/workspace")}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {project.topic}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded-lg hover:bg-bg-secondary shrink-0 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-text-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>重命名</DropdownMenuItem>
                      <DropdownMenuItem className="text-danger">
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={stageColors[project.stage]}
                    className="text-[10px]"
                  >
                    {stageLabels[project.stage]}
                  </Badge>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.lastEdited}
                  </span>
                </div>

                {project.totalChapters > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                      <span>完成度</span>
                      <span>
                        {project.completedChapters}/{project.totalChapters} 章
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{
                          width: `${(project.completedChapters / project.totalChapters) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-3.5 w-3.5" />
                  继续编辑
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
