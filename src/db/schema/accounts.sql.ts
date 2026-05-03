import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  authUser: integer("auth_user").notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 50 }).unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
