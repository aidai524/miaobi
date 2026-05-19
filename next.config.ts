import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.APP_RUNTIME === "cloudflare") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {};

export default nextConfig;
