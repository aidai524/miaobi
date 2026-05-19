import { useNavigate } from "react-router-dom";
import {
  FileText,
  Tag,
  Users,
  Layout,
  Palette,
  Copy,
  BookType,
  Lightbulb,
  Save,
  BookOpen,
  Gauge,
  MessageCircle,
  BookHeart,
  Target,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const analysisData = {
  fileName: "我的写作样本.txt + 课程逐字稿.md",
  fileCount: 2,
  target: "生成可复用的创作模型",
  generatedAt: "2025-05-17 18:30",
  summary:
    "文本整体呈现科普叙事的风格特征，善于使用生活化类比解释复杂概念，段落结构清晰，以'提出问题—分析原因—给出方案'的三段式推进。",
  tags: ["科普", "叙事型", "结构化", "案例驱动", "通俗易懂"],
  readers: "对科技话题有兴趣但无专业背景的大众读者，25-45 岁",
  structure:
    "采用'总—分—总'结构，每章以一个生活场景开头，引出核心问题，然后分2-3个小节展开，最后以要点回顾结尾。",
  style:
    "口语化叙述为主，穿插数据支撑和专业引用。句式以中短句为主，段落长度控制在5-8行。善于使用设问句引导阅读节奏。",
  reusable:
    "三段式论述结构、生活化类比手法、场景引入+问题驱动、要点回顾结尾模式",
  bookType: "最适合改造为通识类或实操类书籍，采用章节+小节的结构模式",
  suggestion:
    "建议保留现有的三段式推进结构，补充更多系统性框架图，注意平衡口语化和书面化的表达比例，在关键章节增加导读和练习。",
  radar: [
    { label: "专业度", value: 65 },
    { label: "通俗度", value: 85 },
    { label: "故事性", value: 70 },
    { label: "观点密度", value: 55 },
    { label: "案例密度", value: 80 },
  ],
};

export default function AnalysisResult() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-2 cursor-pointer"
            onClick={() => navigate("/analyze")}
          >
            返回上传
          </button>
          <h2 className="text-lg font-semibold text-text-primary">
            分析结果
          </h2>
          <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {analysisData.fileName}
            </span>
            <span>{analysisData.fileCount} 个文件</span>
            <span>分析目标：{analysisData.target}</span>
            <span>生成时间：{analysisData.generatedAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/models")}>
            <Save className="h-3.5 w-3.5" />
            保存为创作模型
          </Button>
          <Button size="sm" onClick={() => navigate("/create")}>
            <BookOpen className="h-3.5 w-3.5" />
            基于此分析创建新书
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-accent" />
              内容摘要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-accent" />
              主要主题标签
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {analysisData.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-accent" />
              目标读者判断
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.readers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layout className="h-4 w-4 text-accent" />
              内容结构特点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.structure}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-accent" />
              表达风格特征
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.style}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Copy className="h-4 w-4 text-accent" />
              可复用写作特征
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.reusable}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookType className="h-4 w-4 text-accent" />
              适合改造成什么类型的书
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{analysisData.bookType}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-accent" />
              系统建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              {analysisData.suggestion}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-accent" />
              风格维度分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analysisData.radar.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#e5e3de"
                        strokeWidth="6"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(item.value / 100) * 176} 176`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-text-primary">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8 pb-8">
        <Button variant="outline" onClick={() => navigate("/models")}>
          <Save className="h-4 w-4" />
          保存为创作模型
        </Button>
        <Button onClick={() => navigate("/create")}>
          <BookOpen className="h-4 w-4" />
          基于此分析创建新书
        </Button>
      </div>
    </div>
  );
}
