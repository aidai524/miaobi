import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Tag,
  Users,
  Layout,
  Palette,
  Copy,
  Lightbulb,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const models = [
  {
    id: "m1",
    name: "科普叙事风格",
    source: "10 篇个人博客文章",
    createdAt: "2025-03-10",
    useCase: "适合大众科普类书籍",
    tags: ["通俗", "案例驱动", "结构化"],
    summary:
      "以生活化类比解释复杂概念，采用'提出问题-分析原因-给出方案'的三段式结构，口语化叙述为主。",
    readers: "对科技话题有兴趣但无专业背景的大众读者",
    structure: "总—分—总 结构，场景引入+问题驱动",
    language: "中短句为主，段落5-8行，善于使用设问句",
    content: "案例密度高，每章至少2个真实案例，数据与理论穿插",
    guide:
      "1. 每章从一个生活场景开始\n2. 用类比建立认知锚点\n3. 分2-3小节展开核心观点\n4. 以要点回顾和行动建议结尾",
    avoid: "避免过度使用技术术语，避免大段理论堆砌，避免脱离目标读者的实际场景",
  },
  {
    id: "m2",
    name: "商业案例写作",
    source: "培训课程逐字稿",
    createdAt: "2025-03-05",
    useCase: "适合商业方法类书籍",
    tags: ["犀利", "数据支撑", "实操导向"],
    summary:
      "以问题为驱动，用实验与数据支撑观点，善于将经验提炼为通用框架。",
    readers: "创业者、中小企业家、商业爱好者",
    structure: "问题驱动型，先抛观点再论证，框架式呈现",
    language: "直接有力，观点鲜明，中短句，结论先行",
    content: "每个观点配一个真实案例，数据图表辅助说明",
    guide:
      "1. 每章以一个有争议的问题开头\n2. 用真实案例引入\n3. 提炼可操作的框架\n4. 给出具体执行步骤",
    avoid: "避免空洞说教，避免纯理论探讨，避免长篇累牍",
  },
  {
    id: "m3",
    name: "温和启发风格",
    source: "3 篇样章 + 2 份演讲稿",
    createdAt: "2025-02-28",
    useCase: "适合个人成长、教育类书籍",
    tags: ["温和", "启发性", "理论扎实"],
    summary:
      "以心理学研究为基础，温和而有说服力地引导读者思考和行动。",
    readers: "关注自我提升的年轻人，学生群体",
    structure: "研究引入—理论阐释—实践建议 的三段式",
    language: "温和、有温度，长句与短句交替，注入个人体验",
    content: "以研究数据开篇，逐步过渡到实际应用",
    guide:
      "1. 从一个心理学研究发现开始\n2. 解释其对普通人的意义\n3. 给出可操作的建议\n4. 邀请读者反思和行动",
    avoid: "避免说教口吻，避免过度引用，避免只讲道理不给方法",
  },
];

export default function MyModels() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<(typeof models)[0] | null>(
    null
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            我的创作模型
          </h2>
          <p className="text-sm text-text-muted mt-1">
            管理从文本分析中沉淀的创作模型，用于引导新书的写作风格与结构
          </p>
        </div>
        <Button onClick={() => navigate("/analyze")}>
          <Plus className="h-4 w-4" />
          创建新模型
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="py-20 text-center">
          <Brain className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm mb-4">还没有创作模型</p>
          <Button onClick={() => navigate("/analyze")}>
            <Plus className="h-4 w-4" />
            上传文本创建模型
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedModel(model)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {model.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -mr-1 -mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                  </Button>
                </div>
                <p className="text-xs text-text-muted mb-3">
                  来源：{model.source}
                </p>
                <p className="text-xs text-text-secondary mb-3">
                  {model.useCase}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {model.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted">
                  创建于 {model.createdAt}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/create");
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  基于这个模型创建新书
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  {selectedModel.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    模型摘要
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.summary}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    目标读者
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.readers}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    结构模式
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.structure}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    语言模式
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.language}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    内容模式
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.content}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    写作指南
                  </p>
                  <p className="text-sm text-text-secondary whitespace-pre-line">
                    {selectedModel.guide}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">
                    避免事项
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedModel.avoid}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedModel(null);
                      navigate("/create");
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    基于模型创建新书
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-3.5 w-3.5" />
                    重命名
                  </Button>
                  <Button variant="danger" size="sm">
                    <Trash2 className="h-3.5 w-3.5" />
                    删除
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
