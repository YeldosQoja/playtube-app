import { defineConfig } from "drizzle-kit";

type SSLMode = "require" | "allow" | "prefer" | "verify-full";

const ssl =
  process.env["NODE_ENV"] === "production"
    ? (process.env["DB_SSL"] as SSLMode) || "prefer"
    : false;

export default defineConfig({
  dialect: "postgresql",
  schema: "./dist/db/schema/*",
  dbCredentials: {
    host: process.env["DB_HOST"] || "",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    user: process.env["DB_USER"] || "",
    database: process.env["DB_NAME"] || "",
    password: process.env["DB_PASSWORD"] || "secret",
    ssl,
  },
});
