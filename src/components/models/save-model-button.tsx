"use client";

import { apiError, readApiJson } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SaveModelResponse = {
  model?: { id: number };
};

export function SaveModelButton({ analysisId }: { analysisId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError("");
    setIsSaving(true);
    const response = await fetch(`/api/analyses/${analysisId}/save-as-model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const result = await readApiJson<SaveModelResponse>(response);
    setIsSaving(false);

    if (!response.ok) {
      setError(apiError(result, "保存创作模型失败，请稍后重试"));
      return;
    }

    if (result.model) {
      router.push(`/models/${result.model.id}`);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={save} disabled={isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        保存为创作模型
      </Button>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
