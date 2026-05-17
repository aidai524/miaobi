import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { getDatabasePath, getExportsPath, getUploadsPath } from "../storage/paths";

declare global {
  var __aiBookSqlite: Database.Database | undefined;
}

function prepareLocalStorage() {
  fs.mkdirSync(getUploadsPath(), { recursive: true });
  fs.mkdirSync(getExportsPath(), { recursive: true });
}

function createClient() {
  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  prepareLocalStorage();

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

const sqlite = globalThis.__aiBookSqlite ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__aiBookSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
