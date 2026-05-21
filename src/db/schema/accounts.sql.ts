import {
  bigint,
  pgSequence,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const accountSequence = pgSequence("account_id_seq");

export const accounts = pgTable("accounts", {
  id: bigint({ mode: "number" }).primaryKey(),
  authUser: uuid("auth_user").notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 50 }).unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  birthDate: timestamp("birth_date", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
