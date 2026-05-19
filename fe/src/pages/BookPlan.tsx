import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Target,
  Users,
  BookOpen,
  Tag,
  Zap,
  ListTree,
  AlertTriangle,
  ArrowLeft,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleBookPlan } from "@/data/mock";

export default function BookPlan() {
  const navigate = useNavigate();
  const plan = sampleBookPlan;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-2 cursor-pointer"
            onClick={() => navigate("/create")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回编辑
          </button>
          <h2 className="text-lg font-semibold text-text-primary">
            AI 第一步：从焦虑到理解
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-text-secondary">AI 科普入门</span>
            <Badge variant="default">策划中</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit3 className="h-3.5 w-3.5" />
            编辑当前策划
          </Button>
          <Button size="sm" onClick={() => navigate("/outline")}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            确认并生成完整目录
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-accent" />
              图书定位
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                这本书解决什么问题
              </p>
              <p>{plan.solvesWhat}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                适合谁读
              </p>
              <p>{plan.suitableFor}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                为什么值得写
              </p>
              <p>{plan.worthWriting}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-accent" />
              目标读者画像
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                核心读者
              </p>
              <p>{plan.coreReaders}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                次级读者
              </p>
              <p>{plan.secondaryReaders}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary text-xs mb-1">
                读者的焦虑与期待
              </p>
              <p>
                焦虑：{plan.readerAnxiety}
                <br />
                期待：{plan.readerExpectation}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-accent" />
              书名建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.titles.map((title, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border cursor-pointer transition-colors text-sm ${
                  i === 0
                    ? "border-accent/30 bg-accent-light text-accent font-medium"
                    : "border-border-light hover:border-accent/20 text-text-secondary"
                }`}
              >
                {title}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-accent" />
              副标题建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.subtitles.map((sub, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border-light text-sm text-text-secondary"
              >
                {sub}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-accent" />
              核心卖点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-text-secondary">
              {plan.sellingPoints.map((sp, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent font-medium shrink-0">
                    {i + 1}.
                  </span>
                  {sp}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListTree className="h-4 w-4 text-accent" />
              推荐内容结构
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {plan.structure.map((s, i) => (
                  <div key={i} className="flex gap-3 pl-1">
                    <div className="relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-2 border-accent bg-bg-card mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {s.part}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-accent" />
              风险与编辑建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{plan.risks}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8 pb-8">
        <Button variant="outline">
          <Sparkles className="h-4 w-4" />
          重新生成
        </Button>
        <Button variant="outline">
          <Edit3 className="h-4 w-4" />
          编辑当前策划
        </Button>
        <Button onClick={() => navigate("/outline")}>
          <CheckCircle2 className="h-4 w-4" />
          确认并生成完整目录
        </Button>
      </div>
    </div>
  );
}
