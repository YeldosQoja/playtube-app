import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { bytea } from "../byteaType.js";

export const authUsers = pgTable("auth_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  email: varchar("email", { length: 50 }).unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: bytea("password").notNull(),
  salt: bytea("salt").notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});
