import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { getCloudflareEnv } from "@/lib/cloudflare/env";
import * as schema from "./schema";

function getD1Database() {
  const database = getCloudflareEnv().DB;
  if (!database) {
    throw new Error("Cloudflare D1 binding DB is not configured");
  }
  return database;
}

type CloudflareDb = DrizzleD1Database<typeof schema> & { $client: D1Database };

let cachedDb: CloudflareDb | undefined;

function getDb() {
  cachedDb ??= drizzle(getD1Database(), { schema });
  return cachedDb;
}

export const db = new Proxy({} as CloudflareDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});
