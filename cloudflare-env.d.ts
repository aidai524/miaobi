/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database;
  AI_BOOK_BUCKET: R2Bucket;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  ASSETS: Fetcher;
  IMAGES?: ImagesBinding;
  WORKER_SELF_REFERENCE?: Service;
  APP_RUNTIME: "cloudflare";
  AI_DEFAULT_PROVIDER?: string;
  AI_DEFAULT_MODEL?: string;
  APIMART_API_KEY?: string;
  APIMART_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  QWEN_API_KEY?: string;
  QWEN_BASE_URL?: string;
  ZHIPU_API_KEY?: string;
  ZHIPU_BASE_URL?: string;
}
