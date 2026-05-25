"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateProjectResponse = {
  project?: { id: number };
};

export function CreateProjectFromModelForm({ modelId }: { modelId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/models/${modelId}/create-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: String(formData.get("topic") ?? ""),
        targetReader: String(formData.get("targetReader") ?? ""),
        bookType: String(formData.get("bookType") ?? ""),
        writingStyle: String(formData.get("writingStyle") ?? ""),
        expectedWordCount: String(formData.get("expectedWordCount") ?? ""),
      }),
    });
    const result = await readApiJson<CreateProjectResponse>(response);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(apiError(result, "基于模型创建新书失败，请稍后重试"));
      return;
    }

    if (result.project) {
      router.push(`/projects/${result.project.id}/plan`);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="topic">新书主题</Label>
        <Textarea id="topic" name="topic" maxLength={1000} placeholder="输入想要基于该模型创作的新书主题" required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetReader">目标读者</Label>
          <Input id="targetReader" name="targetReader" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bookType">书籍类型</Label>
          <Input id="bookType" name="bookType" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="writingStyle">写作风格</Label>
          <Input id="writingStyle" name="writingStyle" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedWordCount">预计字数</Label>
          <Input id="expectedWordCount" name="expectedWordCount" type="number" min="1" />
        </div>
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        基于此模型创建新书
      </Button>
    </form>
  );
}
