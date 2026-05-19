import { getCloudflareEnv } from "@/lib/cloudflare/env";
import { isCloudflareRuntime } from "@/lib/runtime";

export function getEnvValue(name: string) {
  if (isCloudflareRuntime()) {
    try {
      const env = getCloudflareEnv() as unknown as Record<string, string | undefined>;
      return env[name] ?? process.env[name];
    } catch {
      return process.env[name];
    }
  }

  return process.env[name];
}
