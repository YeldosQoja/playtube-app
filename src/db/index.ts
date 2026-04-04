import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as accountsSchema from "#db/schema/accounts.sql.js";
import * as categoriesSchema from "#db/schema/categories.sql.js";
import * as commentsSchema from "#db/schema/comments.sql.js";
import * as playlistsSchema from "#db/schema/playlists.sql.js";
import * as relationsSchema from "#db/schema/relations.js";
import * as tagsSchema from "#db/schema/tags.sql.js";
import * as authUsersSchema from "#db/schema/auth-users.sql.js";
import * as videosSchema from "#db/schema/videos.sql.js";
import * as videosToPlaylistsSchema from "#db/schema/videosToPlaylists.sql.js";
import * as videosToTagsSchema from "#db/schema/videosToTags.sql.js";

const env = process.env["NODE_ENV"] || "development";

export const pool = new pg.Pool({
  host: process.env["DB_HOST"] || "",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  user: process.env["DB_USER"] || "",
  database: process.env["DB_NAME"] || "",
  password: process.env["DB_PASSWORD"] || "secret",
  ssl:
    env === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export const db = drizzle(pool, {
  schema: {
    ...accountsSchema,
    ...categoriesSchema,
    ...commentsSchema,
    ...playlistsSchema,
    ...relationsSchema,
    ...tagsSchema,
    ...authUsersSchema,
    ...videosSchema,
    ...videosToPlaylistsSchema,
    ...videosToTagsSchema,
  },
});
