import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    nickname: text("nickname"),
    role: text("role").notNull().default("user"),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash)],
);

export const bookProjects = sqliteTable("book_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  topic: text("topic").notNull(),
  targetReader: text("target_reader"),
  bookType: text("book_type"),
  writingStyle: text("writing_style"),
  expectedWordCount: integer("expected_word_count"),
  referenceModelId: integer("reference_model_id"),
  status: text("status").notNull().default("draft"),
  ...timestamps,
});

export const bookPlans = sqliteTable("book_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => bookProjects.id, { onDelete: "cascade" }),
  positioning: text("positioning"),
  targetReaderAnalysis: text("target_reader_analysis"),
  marketAngle: text("market_angle"),
  corePromise: text("core_promise"),
  titleSuggestions: text("title_suggestions"),
  subtitleSuggestions: text("subtitle_suggestions"),
  sellingPoints: text("selling_points"),
  structureSuggestion: text("structure_suggestion"),
  risks: text("risks"),
  editorialAdvice: text("editorial_advice"),
  aiRawOutput: text("ai_raw_output"),
  ...timestamps,
});

export const outlineNodes = sqliteTable("outline_nodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => bookProjects.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  level: integer("level").notNull(),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  writingGoal: text("writing_goal"),
  suggestedWordCount: integer("suggested_word_count"),
  ...timestamps,
});

export const chapters = sqliteTable(
  "chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => bookProjects.id, { onDelete: "cascade" }),
    outlineNodeId: integer("outline_node_id")
      .notNull()
      .references(() => outlineNodes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
    status: text("status").notNull().default("draft"),
    wordCount: integer("word_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [uniqueIndex("chapters_outline_node_id_unique").on(table.outlineNodeId)],
);

export const chapterVersions = sqliteTable("chapter_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  content: text("content").notNull(),
  createdBy: text("created_by").notNull().default("ai"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const uploadedDocuments = sqliteTable("uploaded_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  storedPath: text("stored_path").notNull(),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  status: text("status").notNull().default("uploaded"),
  ...timestamps,
});

export const textAnalyses = sqliteTable("text_analyses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentId: integer("document_id")
    .notNull()
    .references(() => uploadedDocuments.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type"),
  summary: text("summary"),
  contentTopics: text("content_topics"),
  readerProfile: text("reader_profile"),
  structureAnalysis: text("structure_analysis"),
  styleAnalysis: text("style_analysis"),
  reusableTraits: text("reusable_traits"),
  writingAdvice: text("writing_advice"),
  aiRawOutput: text("ai_raw_output"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const writingModels = sqliteTable("writing_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tags: text("tags"),
  sourceType: text("source_type"),
  sourceAnalysisId: integer("source_analysis_id").references(() => textAnalyses.id, {
    onDelete: "set null",
  }),
  modelSummary: text("model_summary"),
  applicableScenarios: text("applicable_scenarios"),
  targetReader: text("target_reader"),
  structurePattern: text("structure_pattern"),
  languagePattern: text("language_pattern"),
  contentPattern: text("content_pattern"),
  writingGuidelines: text("writing_guidelines"),
  avoidRules: text("avoid_rules"),
  promptTemplate: text("prompt_template"),
  ...timestamps,
});

export const publicAuthors = sqliteTable("public_authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  bio: text("bio"),
  mainFields: text("main_fields"),
  representativeBooks: text("representative_books"),
  writingTraits: text("writing_traits"),
  tags: text("tags"),
  ...timestamps,
});

export const publicBooks = sqliteTable("public_books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  authorName: text("author_name"),
  primaryAuthorId: integer("primary_author_id").references(() => publicAuthors.id, {
    onDelete: "set null",
  }),
  publisher: text("publisher"),
  publishDate: text("publish_date"),
  category: text("category"),
  tags: text("tags"),
  summary: text("summary"),
  tableOfContents: text("table_of_contents"),
  recommendationReason: text("recommendation_reason"),
  coverUrl: text("cover_url"),
  sourceNote: text("source_note"),
  ...timestamps,
});

export const publicBookAuthors = sqliteTable(
  "public_book_authors",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => publicBooks.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => publicAuthors.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("public_book_authors_unique").on(table.bookId, table.authorId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(authSessions),
  projects: many(bookProjects),
  documents: many(uploadedDocuments),
  writingModels: many(writingModels),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id],
  }),
}));

export const publicBooksRelations = relations(publicBooks, ({ one, many }) => ({
  primaryAuthor: one(publicAuthors, {
    fields: [publicBooks.primaryAuthorId],
    references: [publicAuthors.id],
  }),
  authors: many(publicBookAuthors),
}));

export const publicAuthorsRelations = relations(publicAuthors, ({ many }) => ({
  books: many(publicBookAuthors),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
