"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReferenceModelOption = {
  id: number;
  name: string;
};

type ProjectCreateFormProps = {
  models?: ReferenceModelOption[];
  defaultReferenceModelId?: number;
  defaults?: {
    topic?: string;
    targetReader?: string;
    bookType?: string;
    writingStyle?: string;
  };
};

type CreateProjectResponse = {
  project?: { id: number };
};

export function ProjectCreateForm({ models = [], defaultReferenceModelId, defaults = {} }: ProjectCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      topic: String(formData.get("topic") ?? ""),
      targetReader: String(formData.get("targetReader") ?? ""),
      bookType: String(formData.get("bookType") ?? ""),
      writingStyle: String(formData.get("writingStyle") ?? ""),
      expectedWordCount: String(formData.get("expectedWordCount") ?? ""),
      referenceModelId: Number(formData.get("referenceModelId")) || undefined,
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readApiJson<CreateProjectResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "创建项目失败，请稍后重试"));
      return;
    }

    if (result.project) {
      router.push(`/projects/${result.project.id}/plan`);
    }
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="topic">图书主题</Label>
        <Textarea
          id="topic"
          name="topic"
          className="min-h-[140px]"
          placeholder="例如：面向中小企业老板的 AI 提效实战手册"
          defaultValue={defaults.topic}
          maxLength={1000}
          required
        />
        <p className="text-xs text-text-muted">
          描述越具体，策划案越精准。可以包含你的核心观点、目标读者群、希望达到的效果。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetReader">目标读者</Label>
          <Input
            id="targetReader"
            name="targetReader"
            defaultValue={defaults.targetReader}
            placeholder="例如：创业者、管理者、自由职业者"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bookType">书籍类型</Label>
          <Input
            id="bookType"
            name="bookType"
            defaultValue={defaults.bookType}
            placeholder="例如：商业、教育、方法论、个人成长"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="writingStyle">写作风格</Label>
          <Input
            id="writingStyle"
            name="writingStyle"
            defaultValue={defaults.writingStyle}
            placeholder="例如：专业但通俗、案例丰富"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedWordCount">预计字数</Label>
          <Input id="expectedWordCount" name="expectedWordCount" type="number" min="1" placeholder="例如：80000" />
        </div>
      </div>

      {models.length ? (
        <div className="space-y-2">
          <Label htmlFor="referenceModelId">参考创作模型</Label>
          <select
            id="referenceModelId"
            name="referenceModelId"
            defaultValue={defaultReferenceModelId ?? ""}
            className="flex h-10 w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
          >
            <option value="">不使用创作模型</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted">选择后，策划案和目录生成会读取该模型的结构、风格和写作约束。</p>
        </div>
      ) : null}

      {error ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        生成图书策划
      </Button>
    </form>
  );
}
