import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories.sql.js";
import { accounts } from "./accounts.sql.js";

export const privacyEnum = pgEnum("privacy", ["public", "private", "unlisted"]);

export const videos = pgTable("videos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  author: integer("author")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  key: varchar("key", { length: 60 }).unique().notNull(),
  thumbnailKey: varchar("thumbnail_key", {
    length: 60,
  }).unique(),
  title: varchar("title", { length: 60 }).notNull(),
  desc: text("desc"),
  category: integer("category").references(() => categories.id, {
    onDelete: "set null",
  }),
  status: varchar("status", { length: 24 }).notNull().default("PROCESSING"),
  isForKids: boolean("is_for_kids").default(false),
  isAgeRestricted: boolean("is_age_restricted").default(false),
  allowComments: boolean("allow_comments").default(true),
  allowDownloads: boolean("allow_downloads").default(false),
  privacy: privacyEnum("privacy"),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
