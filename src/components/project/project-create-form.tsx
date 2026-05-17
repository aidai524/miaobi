"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectCreateForm() {
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
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error ?? "创建项目失败，请稍后重试");
      return;
    }

    router.push(`/projects/${result.project.id}/plan`);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="topic">图书主题</Label>
        <Textarea
          id="topic"
          name="topic"
          className="min-h-28"
          placeholder="例如：面向中小企业老板的 AI 提效实战手册"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetReader">目标读者</Label>
          <Input id="targetReader" name="targetReader" placeholder="例如：创业者、管理者、自由职业者" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bookType">书籍类型</Label>
          <Input id="bookType" name="bookType" placeholder="例如：商业、教育、方法论、个人成长" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="writingStyle">写作风格</Label>
          <Input id="writingStyle" name="writingStyle" placeholder="例如：专业但通俗、案例丰富" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedWordCount">预计字数</Label>
          <Input id="expectedWordCount" name="expectedWordCount" type="number" min="1" placeholder="例如：80000" />
        </div>
      </div>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        生成图书策划
      </Button>
    </form>
  );
}
