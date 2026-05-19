import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Sparkles,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  recentProjects,
  recentModels,
  inspirationCards,
  stageLabels,
  stageColors,
} from "@/data/mock";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-8">
      <section>
        <div className="bg-bg-card rounded-2xl border border-border-light p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary leading-tight">
                让任何人，都能完成一本真正像样的书
              </h2>
              <p className="text-text-secondary mt-2 leading-relaxed">
                从选题定位、标杆分析、目录设计，到章节写作与书稿导出，一站完成。
              </p>
              <div className="flex items-center gap-3 mt-6">
                <Button size="lg" onClick={() => navigate("/create")}>
                  <Sparkles className="h-4 w-4" />
                  创建我的第一本书
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/analyze")}
                >
                  <Upload className="h-4 w-4" />
                  上传文本，生成创作模型
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center w-48 h-36 rounded-2xl bg-accent-light">
              <BookOpen className="h-16 w-16 text-accent/40" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近项目</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                查看全部 <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">还没有书籍项目</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate("/create")}
                >
                  创建第一本书
                </Button>
              </div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate("/workspace")}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={stageColors[project.stage]} className="text-[10px]">
                        {stageLabels[project.stage]}
                      </Badge>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.lastEdited}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-text-muted shrink-0 ml-4">
                    {project.completedChapters}/{project.totalChapters} 章
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近模型</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/models")}
              >
                查看全部 <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentModels.length === 0 ? (
              <div className="py-8 text-center">
                <Sparkles className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">还没有创作模型</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate("/analyze")}
                >
                  上传文本创建模型
                </Button>
              </div>
            ) : (
              recentModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate("/models")}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {model.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {model.source}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {model.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 ml-4">
                    使用
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          推荐灵感
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inspirationCards.map((card) => (
            <Card
              key={card.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/create")}
            >
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    {card.title}
                  </h4>
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  {card.description}
                </p>
                <div className="flex gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-text-muted bg-bg-secondary rounded-md px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
