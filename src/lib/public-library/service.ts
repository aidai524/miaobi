import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicAuthors, publicBooks } from "@/lib/db/schema";
import type {
  PublicAuthorQuery,
  PublicBookQuery,
  UpsertPublicAuthorInput,
  UpsertPublicBookInput,
} from "./validation";

export async function listPublicBooks(query: PublicBookQuery = {}) {
  const conditions = [
    query.q
      ? or(like(publicBooks.title, `%${query.q}%`), like(publicBooks.subtitle, `%${query.q}%`))
      : undefined,
    query.author ? like(publicBooks.authorName, `%${query.author}%`) : undefined,
    query.category ? eq(publicBooks.category, query.category) : undefined,
  ].filter(Boolean);

  return db
    .select()
    .from(publicBooks)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(publicBooks.updatedAt), asc(publicBooks.title));
}

export async function listPublicAuthors(query: PublicAuthorQuery = {}) {
  const conditions = [
    query.q
      ? or(
          like(publicAuthors.name, `%${query.q}%`),
          like(publicAuthors.representativeBooks, `%${query.q}%`),
          like(publicAuthors.writingTraits, `%${query.q}%`),
        )
      : undefined,
    query.field ? like(publicAuthors.mainFields, `%${query.field}%`) : undefined,
  ].filter(Boolean);

  return db
    .select()
    .from(publicAuthors)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(publicAuthors.updatedAt), asc(publicAuthors.name));
}

export async function listPublicBookCategories() {
  const rows = await db
    .select({ category: publicBooks.category })
    .from(publicBooks)
    .where(like(publicBooks.category, "_%"))
    .orderBy(asc(publicBooks.category));

  return Array.from(new Set(rows.map((row) => row.category).filter((value): value is string => Boolean(value))));
}

export async function listPublicAuthorFields() {
  const rows = await db
    .select({ field: publicAuthors.mainFields })
    .from(publicAuthors)
    .where(like(publicAuthors.mainFields, "_%"))
    .orderBy(asc(publicAuthors.mainFields));

  const fields = rows.flatMap((row) =>
    splitTextList(row.field).map((field) => field.replace(/^#+/, "").trim()),
  );
  return Array.from(new Set(fields.filter(Boolean)));
}

export async function getPublicBook(bookId: number) {
  const rows = await db
    .select({
      book: publicBooks,
      primaryAuthor: publicAuthors,
    })
    .from(publicBooks)
    .leftJoin(publicAuthors, eq(publicBooks.primaryAuthorId, publicAuthors.id))
    .where(eq(publicBooks.id, bookId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPublicAuthor(authorId: number) {
  const rows = await db.select().from(publicAuthors).where(eq(publicAuthors.id, authorId)).limit(1);
  return rows[0] ?? null;
}

export async function createPublicBook(input: UpsertPublicBookInput) {
  const rows = await db.insert(publicBooks).values(input).returning();
  return rows[0];
}

export async function updatePublicBook(bookId: number, input: UpsertPublicBookInput) {
  const book = await getPublicBook(bookId);
  if (!book) {
    return null;
  }

  const rows = await db
    .update(publicBooks)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(publicBooks.id, bookId))
    .returning();
  return rows[0] ?? null;
}

export async function deletePublicBook(bookId: number) {
  const book = await getPublicBook(bookId);
  if (!book) {
    return false;
  }

  await db.delete(publicBooks).where(eq(publicBooks.id, bookId));
  return true;
}

export async function createPublicAuthor(input: UpsertPublicAuthorInput) {
  const rows = await db.insert(publicAuthors).values(input).returning();
  return rows[0];
}

export async function updatePublicAuthor(authorId: number, input: UpsertPublicAuthorInput) {
  const author = await getPublicAuthor(authorId);
  if (!author) {
    return null;
  }

  const rows = await db
    .update(publicAuthors)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(publicAuthors.id, authorId))
    .returning();
  return rows[0] ?? null;
}

export async function deletePublicAuthor(authorId: number) {
  const author = await getPublicAuthor(authorId);
  if (!author) {
    return false;
  }

  await db.delete(publicAuthors).where(eq(publicAuthors.id, authorId));
  return true;
}

export async function importPublicBooks(inputs: UpsertPublicBookInput[]) {
  if (!inputs.length) {
    return [];
  }
  return db.insert(publicBooks).values(inputs).returning();
}

export async function importPublicAuthors(inputs: UpsertPublicAuthorInput[]) {
  if (!inputs.length) {
    return [];
  }
  return db.insert(publicAuthors).values(inputs).returning();
}

export function splitTextList(value: string | null | undefined) {
  if (!value) {
    return [];
  }
  return value
    .split(/[\n,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
