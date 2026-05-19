import { getDefaultAiProvider, type AiProviderKey, AI_PROVIDERS } from "./config";
import { getEnvValue } from "@/lib/env";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionInput = {
  provider?: AiProviderKey;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  responseFormat?: "json_object" | "text";
};

export class AiConfigurationError extends Error {}
export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly code?: "timeout" | "request",
  ) {
    super(message);
  }
}

const DEFAULT_TIMEOUT_MS = 120_000;

function getProvider(key?: AiProviderKey) {
  const provider = key ? AI_PROVIDERS.find((item) => item.key === key) : getDefaultAiProvider();
  if (!provider) {
    throw new AiConfigurationError("AI 服务商配置不存在");
  }

  return provider;
}

function buildChatCompletionsUrl(baseUrl: string) {
  const normalized = baseUrl.replace(/\/$/, "");
  if (normalized.includes("apimart.ai")) {
    if (normalized.endsWith("/api/v1/chat/completions")) {
      return normalized;
    }
    if (normalized.endsWith("/v1/chat/completions")) {
      return normalized.replace(/\/v1\/chat\/completions$/, "/api/v1/chat/completions");
    }
    if (normalized.endsWith("/api/v1")) {
      return `${normalized}/chat/completions`;
    }
    if (normalized.endsWith("/v1")) {
      return normalized.replace(/\/v1$/, "/api/v1/chat/completions");
    }
    if (normalized.endsWith("/api")) {
      return `${normalized}/v1/chat/completions`;
    }
    return `${normalized}/api/v1/chat/completions`;
  }
  if (normalized.endsWith("/chat/completions")) {
    return normalized;
  }
  if (normalized.endsWith("/v1")) {
    return `${normalized}/chat/completions`;
  }
  return `${normalized}/v1/chat/completions`;
}

export async function createChatCompletion(input: ChatCompletionInput) {
  const provider = getProvider(input.provider);
  const apiKey = getEnvValue(provider.apiKeyEnv);
  const baseUrl = getEnvValue(provider.baseUrlEnv);

  if (!apiKey || !baseUrl) {
    throw new AiConfigurationError(`请配置 ${provider.apiKeyEnv} 和 ${provider.baseUrlEnv}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(buildChatCompletionsUrl(baseUrl), {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model ?? getEnvValue("AI_DEFAULT_MODEL") ?? provider.defaultModel,
        messages: input.messages,
        temperature: input.temperature ?? 0.4,
        ...(typeof input.maxTokens === "number" ? { max_tokens: input.maxTokens } : {}),
        ...(input.responseFormat === "text"
          ? {}
          : { response_format: { type: input.responseFormat ?? "json_object" } }),
        stream: false,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError("AI 请求超时，请稍后重试", "timeout");
    }

    throw new AiProviderError(
      error instanceof Error ? `AI 请求失败：${error.message}` : "AI 请求失败，请稍后重试",
      "request",
    );
  } finally {
    clearTimeout(timeout);
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    throw new AiProviderError(
      error instanceof Error ? `AI 响应读取失败：${error.message}` : "AI 响应读取失败，请稍后重试",
      "request",
    );
  }
  const payload = parseProviderPayload(text);

  if (payload?.code && payload.code !== 200) {
    const message = payload.message ?? payload.error?.message ?? `AI 请求失败：${payload.code}`;
    throw new AiProviderError(message, "request");
  }

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? `AI 请求失败：${response.status}`;
    throw new AiProviderError(message, "request");
  }

  const content = getContentFromPayload(payload);
  if (typeof content !== "string" || !content.trim()) {
    throw new AiProviderError("AI 返回内容为空", "request");
  }

  return content;
}

function parseProviderPayload(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("data:")) {
    return parseSsePayload(trimmed);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return { choices: [{ message: { content: trimmed } }] };
  }
}

function parseSsePayload(text: string) {
  const chunks = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, ""))
    .filter((line) => line && line !== "[DONE]");

  let content = "";
  let lastPayload: Record<string, unknown> | null = null;

  for (const chunk of chunks) {
    try {
      const payload = JSON.parse(chunk);
      lastPayload = payload;
      const choice = payload?.choices?.[0];
      content += choice?.delta?.content ?? choice?.message?.content ?? "";
    } catch {
      // Ignore malformed transport fragments and keep parsing later chunks.
    }
  }

  if (content) {
    return { choices: [{ message: { content } }] };
  }

  return lastPayload;
}

function getContentFromPayload(payload: {
  code?: number;
  data?: {
    choices?: Array<{
      message?: { content?: unknown };
      delta?: { content?: unknown };
      text?: unknown;
    }>;
    output_text?: unknown;
    content?: unknown;
  };
  choices?: Array<{
    message?: { content?: unknown };
    delta?: { content?: unknown };
    text?: unknown;
  }>;
  output_text?: unknown;
  content?: unknown;
} | null) {
  if (!payload) {
    return null;
  }

  const source = payload.data ?? payload;
  return (
    source.choices?.[0]?.message?.content ??
    source.choices?.[0]?.delta?.content ??
    source.choices?.[0]?.text ??
    source.output_text ??
    source.content
  );
}
