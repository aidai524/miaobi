import { getDefaultAiProvider, type AiProviderKey, AI_PROVIDERS } from "./config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionInput = {
  provider?: AiProviderKey;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
};

export class AiConfigurationError extends Error {}
export class AiProviderError extends Error {}

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
  const apiKey = process.env[provider.apiKeyEnv];
  const baseUrl = process.env[provider.baseUrlEnv];

  if (!apiKey || !baseUrl) {
    throw new AiConfigurationError(`请配置 ${provider.apiKeyEnv} 和 ${provider.baseUrlEnv}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
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
        model: input.model ?? process.env.AI_DEFAULT_MODEL ?? provider.defaultModel,
        messages: input.messages,
        temperature: input.temperature ?? 0.4,
        response_format: { type: "json_object" },
        stream: false,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError("AI 请求超时，请稍后重试");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const payload = parseProviderPayload(text);

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? `AI 请求失败：${response.status}`;
    throw new AiProviderError(message);
  }

  const content = getContentFromPayload(payload);
  if (typeof content !== "string" || !content.trim()) {
    throw new AiProviderError("AI 返回内容为空");
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

  return (
    payload.choices?.[0]?.message?.content ??
    payload.choices?.[0]?.delta?.content ??
    payload.choices?.[0]?.text ??
    payload.output_text ??
    payload.content
  );
}
