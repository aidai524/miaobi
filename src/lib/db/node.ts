import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
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

type NodeDb = BetterSQLite3Database<typeof schema>;

let cachedSqlite: Database.Database | undefined;
let cachedDb: NodeDb | undefined;

export function getSqlite() {
  cachedSqlite ??= globalThis.__aiBookSqlite ?? createClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.__aiBookSqlite = cachedSqlite;
  }

  return cachedSqlite;
}

function getDb() {
  cachedDb ??= drizzle(getSqlite(), { schema });
  return cachedDb;
}

export const db = new Proxy({} as NodeDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});
