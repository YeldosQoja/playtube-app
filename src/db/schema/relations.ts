import { relations } from "drizzle-orm";
import { videos } from "./videos.sql.js";
import { videosToPlaylists } from "./videosToPlaylists.sql.js";
import { playlists } from "./playlists.sql.js";
import { comments } from "./comments.sql.js";
import { videosToTags } from "./videosToTags.sql.js";
import { tags } from "./tags.sql.js";
import { categories } from "./categories.sql.js";
import { accounts } from "./accounts.sql.js";

export const accountsRelations = relations(accounts, ({ many }) => ({
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ many, one }) => ({
  author: one(accounts, {
    fields: [videos.author],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [videos.category],
    references: [categories.id],
  }),
  comments: many(comments),
  videosToPlaylists: many(videosToPlaylists),
  tags: many(videosToTags),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  videosToPlaylists: many(videosToPlaylists),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  videosToTags: many(videosToTags),
}));

export const videosToPlaylistsRelations = relations(
  videosToPlaylists,
  ({ one }) => ({
    video: one(videos, {
      fields: [videosToPlaylists.video],
      references: [videos.id],
    }),
    playlist: one(playlists, {
      fields: [videosToPlaylists.playlist],
      references: [playlists.id],
    }),
  }),
);

export const videosToTagsRelations = relations(videosToTags, ({ one }) => ({
  video: one(videos, {
    fields: [videosToTags.video],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [videosToTags.tag],
    references: [tags.id],
  }),
}));
