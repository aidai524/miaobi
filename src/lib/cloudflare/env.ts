import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AiBookCloudflareEnv = CloudflareEnv & {
  DB?: D1Database;
  AI_BOOK_BUCKET?: R2Bucket;
};

export function getCloudflareEnv() {
  return getCloudflareContext().env as AiBookCloudflareEnv;
}
