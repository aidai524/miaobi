import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AiConfigurationError, AiProviderError } from "@/lib/ai/client";
import { AiJsonParseError } from "@/lib/ai/json";

export function parseId(value: string | undefined) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function errorResponse(error: unknown, fallback = "请求失败，请稍后重试") {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "提交内容无效" }, { status: 400 });
  }

  if (error instanceof AiConfigurationError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof AiProviderError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  if (error instanceof AiJsonParseError) {
    return NextResponse.json({ error: "AI 返回格式不符合要求，请稍后重试" }, { status: 502 });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}
