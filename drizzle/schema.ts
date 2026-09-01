import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  parentId: int("parentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const encyclopediaEntries = mysqlTable("encyclopediaEntries", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  type: varchar("type", { length: 60 }).notNull(),
  titleAr: varchar("titleAr", { length: 240 }).notNull(),
  titleEn: varchar("titleEn", { length: 240 }).notNull(),
  summaryAr: text("summaryAr"),
  summaryEn: text("summaryEn"),
  contentAr: text("contentAr"),
  contentEn: text("contentEn"),
  imageUrl: text("imageUrl"),
  categoryId: int("categoryId"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type EncyclopediaEntry = typeof encyclopediaEntries.$inferSelect;
