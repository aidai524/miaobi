import { getEnvValue } from "@/lib/env";

export type AiProviderKey = "apimart" | "openai" | "deepseek" | "qwen" | "zhipu";

export type AiProviderConfig = {
  key: AiProviderKey;
  label: string;
  baseUrlEnv: string;
  apiKeyEnv: string;
  defaultModel: string;
};

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    key: "apimart",
    label: "Apimart",
    baseUrlEnv: "APIMART_BASE_URL",
    apiKeyEnv: "APIMART_API_KEY",
    defaultModel: "deepseek-v3-0324",
  },
  {
    key: "openai",
    label: "OpenAI",
    baseUrlEnv: "OPENAI_BASE_URL",
    apiKeyEnv: "OPENAI_API_KEY",
    defaultModel: "gpt-5",
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-v4-pro",
  },
  {
    key: "qwen",
    label: "通义千问",
    baseUrlEnv: "QWEN_BASE_URL",
    apiKeyEnv: "QWEN_API_KEY",
    defaultModel: "qwen-plus",
  },
  {
    key: "zhipu",
    label: "智谱",
    baseUrlEnv: "ZHIPU_BASE_URL",
    apiKeyEnv: "ZHIPU_API_KEY",
    defaultModel: "glm-4.5",
  },
];

export function getDefaultAiProvider() {
  const configured = getEnvValue("AI_DEFAULT_PROVIDER") as AiProviderKey | undefined;
  return AI_PROVIDERS.find((provider) => provider.key === configured) ?? AI_PROVIDERS[0];
}
