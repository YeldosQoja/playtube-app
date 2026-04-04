import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { videos } from "./videos.sql.js";
import { accounts } from "./accounts.sql.js";

export const comments = pgTable("comments", {
  id: integer("id").unique().generatedAlwaysAsIdentity().primaryKey(),
  author: integer("author")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  video: integer("video")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  parentComment: integer("parent_comment").references(
    (): AnyPgColumn => comments.id,
    { onDelete: "cascade" },
  ),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
});
