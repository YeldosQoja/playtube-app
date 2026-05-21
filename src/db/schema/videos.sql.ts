import {
  bigint,
  boolean,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories.sql.js";
import { accounts } from "./accounts.sql.js";

export const privacyEnum = pgEnum("privacy", ["public", "private", "unlisted"]);
export const videoSequence = pgSequence("video_id_seq");

export const videos = pgTable("videos", {
  id: bigint({ mode: "number" }).primaryKey(),
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
  isForKids: boolean("is_for_kids").notNull().default(false),
  isAgeRestricted: boolean("is_age_restricted").notNull().default(false),
  allowComments: boolean("allow_comments").notNull().default(true),
  allowDownloads: boolean("allow_downloads").notNull().default(false),
  privacy: privacyEnum("privacy"),
  publicationStatus: varchar("publication_status", { length: 50 }),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
