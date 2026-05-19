import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  targetReaders,
  bookTypes,
  expressionStyles,
  wordCounts,
} from "@/data/mock";

export default function CreateBook() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [reader, setReader] = useState("");
  const [bookType, setBookType] = useState("");
  const [style, setStyle] = useState("");
  const [wordCount, setWordCount] = useState("");

  const sampleTopics = [
    "用通俗的语言讲清楚人工智能的过去、现在和未来",
    "AI 时代家长如何培养孩子的核心竞争力",
    "从街边小店到连锁经营：可复制的小生意方法论",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              定义你的图书需求
            </h2>
            <p className="text-sm text-text-muted">
              写下你的核心主题，AI 将为你生成完整的图书策划案。
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                书籍主题
              </label>
              <Textarea
                placeholder="例如：AI 时代普通人如何提升自己的不可替代性……"
                className="min-h-[140px]"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1.5">
                描述越具体，策划案越精准。可以包含你的核心观点、目标读者群、希望达到的效果。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  目标读者
                </label>
                <Select value={reader} onValueChange={setReader}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择目标读者" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetReaders.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  书籍类型
                </label>
                <Select value={bookType} onValueChange={setBookType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  表达风格
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {expressionStyles.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  预计字数
                </label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择字数" />
                  </SelectTrigger>
                  <SelectContent>
                    {wordCounts.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                是否使用参考模型
              </label>
              <p className="text-xs text-text-muted mb-2">
                可选，使用已有的创作模型来引导风格和结构
              </p>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="不选择（默认）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不选择（默认）</SelectItem>
                  <SelectItem value="m1">科普叙事风格</SelectItem>
                  <SelectItem value="m2">商业案例写作</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mt-2"
            onClick={() => navigate("/plan")}
          >
            <Sparkles className="h-4 w-4" />
            生成图书策划案
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                什么样的主题适合开始
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-secondary space-y-3">
              <p>
                一个好的主题具备三个特征：你有独特的经验或观点、有明确的目标读者群、能解决一个具体的问题。
              </p>
              <p>
                不需要你已经写完全文，只需要一个清晰的方向。AI
                会帮你完成从定位到目录的全过程。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-text-primary">
                示例主题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleTopics.map((t, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors text-left w-full cursor-pointer"
                  onClick={() => setTopic(t)}
                >
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  {t}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
