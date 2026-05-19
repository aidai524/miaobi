import type { AppDb } from "./types";
import { isCloudflareRuntime } from "@/lib/runtime";

function getDb() {
  // Keep this synchronous so existing Drizzle call sites can use `db.select()` directly.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return isCloudflareRuntime() ? require("./cloudflare").db : require("./node").db;
}

export const db = new Proxy({} as AppDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});
