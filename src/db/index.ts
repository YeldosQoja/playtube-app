import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as categoriesSchema from "./schema/categories.sql.js";
import * as commentsSchema from "./schema/comments.sql.js";
import * as playlistsSchema from "./schema/playlists.sql.js";
import * as relationsSchema from "./schema/relations.js";
import * as tagsSchema from "./schema/tags.sql.js";
import * as usersSchema from "./schema/users.sql.js";
import * as videosSchema from "./schema/videos.sql.js";
import * as videosToPlaylistsSchema from "./schema/videosToPlaylists.sql.js";
import * as videosToTagsSchema from "./schema/videosToTags.sql.js";

export const pool = new pg.Pool({
  host: process.env["DB_HOST"] || "",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  user: process.env["DB_USER"] || "",
  database: process.env["DB_NAME"] || "",
  password: process.env["DB_PASSWORD"] || "secret",
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, {
  schema: {
    ...categoriesSchema,
    ...commentsSchema,
    ...playlistsSchema,
    ...relationsSchema,
    ...tagsSchema,
    ...usersSchema,
    ...videosSchema,
    ...videosToPlaylistsSchema,
    ...videosToTagsSchema,
  },
});
