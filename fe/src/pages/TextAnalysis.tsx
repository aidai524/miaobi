import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  File,
  Sparkles,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { sampleFiles, analysisTargets } from "@/data/mock";

export default function TextAnalysis() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([...sampleFiles]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const tips = [
    "上传你自己的文章，AI 会分析你的写作风格和习惯",
    "上传课程稿或演讲稿，评估如何转化为书稿",
    "上传你喜欢的样章，学习优秀作者的表达方式",
    "上传内部资料或旧稿，看看能否重新组织成书",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              上传文本进行分析
            </h2>
            <p className="text-sm text-text-muted">
              支持 txt / md / docx / pdf 格式，可拖拽上传
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-accent/30 transition-colors cursor-pointer bg-bg-secondary/50">
            <Upload className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-text-primary">
              拖拽文件到此处，或点击上传
            </p>
            <p className="text-xs text-text-muted mt-1">
              支持 txt / md / docx / pdf
            </p>
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">
                已上传文件
              </h3>
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-border-light bg-bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light">
                        <File className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {file.size} · {file.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-1.5 rounded-lg hover:bg-bg-secondary cursor-pointer"
                      onClick={() =>
                        setFiles(files.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4 text-text-muted" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">
              选择分析目标
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analysisTargets.map((target) => (
                <div
                  key={target.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTarget === target.id
                      ? "border-accent/40 bg-accent-light"
                      : "border-border-light bg-bg-card hover:border-accent/20"
                  }`}
                  onClick={() => setSelectedTarget(target.id)}
                >
                  <p className="text-sm font-medium text-text-primary">
                    {target.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {target.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={files.length === 0 || !selectedTarget}
            onClick={() => navigate("/analysis-result")}
          >
            <Sparkles className="h-4 w-4" />
            开始分析
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                温馨提示
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-2 text-sm text-text-secondary">
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
