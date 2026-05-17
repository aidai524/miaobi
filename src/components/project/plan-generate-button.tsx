"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanGenerateButtonProps = {
  projectId: number;
  hasPlan: boolean;
};

export function PlanGenerateButton({ projectId, hasPlan }: PlanGenerateButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePlan() {
    setError("");
    setIsGenerating(true);
    const response = await fetch(`/api/projects/${projectId}/generate-plan`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    setIsGenerating(false);

    if (!response.ok) {
      setError(result.error ?? "生成失败，请稍后重试");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Button onClick={generatePlan} disabled={isGenerating}>
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {hasPlan ? "重新生成策划案" : "生成策划案"}
      </Button>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
