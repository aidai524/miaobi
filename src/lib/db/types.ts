import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./schema";

export type AppDb = DrizzleD1Database<typeof schema>;
export type AppDbTransaction = Parameters<Parameters<AppDb["transaction"]>[0]>[0];
