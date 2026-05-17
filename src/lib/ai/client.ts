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

  const response = await fetch(buildChatCompletionsUrl(baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model ?? process.env.AI_DEFAULT_MODEL ?? provider.defaultModel,
      messages: input.messages,
      temperature: input.temperature ?? 0.4,
      response_format: { type: "json_object" },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? `AI 请求失败：${response.status}`;
    throw new AiProviderError(message);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AiProviderError("AI 返回内容为空");
  }

  return content;
}
