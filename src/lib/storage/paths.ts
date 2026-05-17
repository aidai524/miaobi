import path from "node:path";

export function getStorageRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.env.STORAGE_ROOT ?? "./data");
}

export function getDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./data/database.sqlite";
  return path.resolve(/* turbopackIgnore: true */ databaseUrl.replace(/^file:/, ""));
}

export function getUploadsPath() {
  return path.join(getStorageRoot(), "uploads");
}

export function getExportsPath() {
  return path.join(getStorageRoot(), "exports");
}
