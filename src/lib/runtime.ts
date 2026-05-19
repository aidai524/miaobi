export type AppRuntime = "node" | "cloudflare";

export function getAppRuntime(): AppRuntime {
  return process.env.APP_RUNTIME === "cloudflare" ? "cloudflare" : "node";
}

export function isCloudflareRuntime() {
  return getAppRuntime() === "cloudflare";
}
