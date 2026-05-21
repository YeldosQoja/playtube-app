import {
  bigint,
  integer,
  pgSequence,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts.sql.js";

export const playlistSequence = pgSequence("playlist_id_seq");

export const playlists = pgTable("playlists", {
  id: bigint({ mode: "number" }).primaryKey(),
  title: varchar("title", { length: 60 }).notNull(),
  desc: varchar("desc", { length: 180 }),
  thumbnailStorageKey: varchar("thumbnail_storage_key", {
    length: 60,
  })
    .unique()
    .notNull(),
  author: integer("author")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
