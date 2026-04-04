import { and, countDistinct, eq, inArray, sql } from "drizzle-orm";
import { db } from "#db/index.js";
import { videos } from "#db/schema/videos.sql.js";
import { comments } from "#db/schema/comments.sql.js";
import { authUsers } from "#db/schema/auth-users.sql.js";
import { tags } from "#db/schema/tags.sql.js";
import { videosToPlaylists } from "#db/schema/videosToPlaylists.sql.js";
import { videosToTags } from "#db/schema/videosToTags.sql.js";
import { categories } from "#db/schema/categories.sql.js";
import { playlists } from "#db/schema/playlists.sql.js";

export async function findVideoByKey(key: string) {
  const video = await db.query.videos.findFirst({
    where: (fields, operators) => operators.eq(fields.key, key),
    with: {
      author: {
        columns: {
          id: false,
          password: false,
          salt: false,
          createdAt: false,
          email: false,
        },
      },
      category: true,
      tags: {
        columns: {
          video: false,
        },
        with: {
          tag: {
            columns: {
              count: false,
            },
          },
        },
      },
    },
  });

  if (!video) {
    throw new Error(`Video not found with key ${key}.`);
  }

  return video;
}

export async function getUploadedVideos() {
  return await db.query.videos.findMany({
    with: {
      author: {
        columns: {
          id: false,
          password: false,
          salt: false,
          createdAt: false,
          email: false,
        },
      },
      category: true,
    },
  });
}

export async function updateVideo(
  key: string,
  data: typeof videos.$inferInsert,
  playlist: number,
  tagNames: string[],
) {
  await db.transaction(async (tx) => {
    const res = await tx
      .update(videos)
      .set(data)
      .where(eq(videos.key, key))
      .returning();
    const video = res[0];

    if (video === undefined) {
      tx.rollback();
      return;
    }

    if (playlist) {
      await tx.insert(videosToPlaylists).values({
        video: video.id,
        playlist,
        addedAt: new Date().toISOString(),
      });
    }

    for (const tagName of tagNames) {
      const tagsResult = await tx
        .select({
          id: tags.id,
          count: tags.count,
        })
        .from(tags)
        .where(eq(tags.name, tagName));

      let tag = tagsResult[0];

      if (!tag) {
        const result = await tx
          .insert(tags)
          .values({
            name: tagName,
          })
          .returning();

        tag = result[0];
      } else {
        await tx
          .update(tags)
          .set({
            count: sql`${tags.count} + 1`,
          })
          .where(eq(tags.name, tagName));
      }

      await tx.insert(videosToTags).values({
        video: video.id,
        tag: tag!.id,
      });
    }
  });
}

export async function deleteVideo(key: string) {
  await db.delete(videos).where(eq(videos.key, key));
}

export async function createVideoDraft(
  data: typeof videos.$inferInsert,
  playlist?: number,
  tagNames?: string[],
) {
  await db.transaction(async (tx) => {
    const res = await tx.insert(videos).values(data).returning();
    const video = res[0];

    if (video === undefined) {
      tx.rollback();
      return;
    }

    if (playlist) {
      await tx.insert(videosToPlaylists).values({
        video: video.id,
        playlist,
        addedAt: new Date().toISOString(),
      });
    }

    if (tagNames) {
      for (const tagName of tagNames) {
        const tagsResult = await tx
          .select({
            id: tags.id,
            count: tags.count,
          })
          .from(tags)
          .where(eq(tags.name, tagName));

        let tag = tagsResult[0];

        if (!tag) {
          const result = await tx
            .insert(tags)
            .values({
              name: tagName,
            })
            .returning();

          tag = result[0];
        } else {
          await tx
            .update(tags)
            .set({
              count: sql`${tags.count} + 1`,
            })
            .where(eq(tags.name, tagName));
        }

        await tx.insert(videosToTags).values({
          video: video.id,
          tag: tag!.id,
        });
      }
    }
  });
}

export async function updateVideoStatus(key: string, status: string) {
  await db.update(videos).set({ status }).where(eq(videos.key, key));
}

export async function updateStatusForMultipleVideos(
  keys: string[],
  status: string,
) {
  await db.update(videos).set({ status }).where(inArray(videos.key, keys));
}

export async function findVideoById(id: number) {
  const video = await db.query.videos.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
  });

  if (!video) {
    throw new Error(`Video not found with id ${id}.`);
  }

  return video;
}

// Comments queries
export async function createComment(
  data: Omit<typeof comments.$inferInsert, "id" | "createdAt">,
) {
  const result = await db.insert(comments).values(data).returning();
  return result[0];
}

export async function updateComment(id: number, content: string) {
  await db.update(comments).set({ content }).where(eq(comments.id, id));
}

export async function getCommentsByVideoId(
  videoId: number,
  limit: number,
  offset: number = 0,
) {
  return await db
    .select()
    .from(comments)
    .where(eq(comments.video, videoId))
    .limit(limit)
    .offset(offset);
}

// Users queries
export async function findUserByUsername(username: string) {
  const user = await db.query.authUsers.findFirst({
    where: (fields, operators) => operators.eq(fields.username, username),
  });

  if (!user) {
    throw new Error(`There is no such user ${username}`);
  }

  return user;
}

export async function findUserById(id: number) {
  const user = await db.query.authUsers.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
  });

  if (!user) {
    throw new Error(`User not found with id ${id}`);
  }

  return user;
}

export async function createUser(
  data: Omit<typeof authUsers.$inferInsert, "id" | "createdAt">,
) {
  const result = await db
    .insert(authUsers)
    .values(data)
    .returning({ id: authUsers.id, username: authUsers.username });
  return result[0];
}

export async function getVideoCategories() {
  return await db
    .select({ id: categories.id, title: categories.title })
    .from(categories);
}

// Playlists queries
export async function createPlaylist(data: typeof playlists.$inferInsert) {
  const result = await db.insert(playlists).values(data).returning();
  return result[0];
}

export async function getPlaylistsByAuthor(authorId: number) {
  return await db
    .select({
      id: playlists.id,
      title: playlists.title,
      lastUpdatedAt: playlists.lastUpdatedAt,
      videoCount: countDistinct(videosToPlaylists.video),
    })
    .from(playlists)
    .innerJoin(videosToPlaylists, eq(playlists.id, videosToPlaylists.playlist))
    .where(eq(playlists.author, authorId))
    .groupBy(playlists.id)
    .orderBy(playlists.lastUpdatedAt);
}

export async function findPlaylistById(id: number) {
  const playlist = await db.query.playlists.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
    with: {
      videosToPlaylists: {
        with: {
          video: {
            with: {
              author: {
                columns: {
                  id: false,
                  password: false,
                  salt: false,
                  createdAt: false,
                  email: false,
                },
              },
              category: true,
            },
          },
        },
      },
    },
  });

  if (!playlist) {
    throw new Error(`Playlist not found with id ${id}.`);
  }

  return playlist;
}

export async function updatePlaylist(
  id: number,
  data: Partial<typeof playlists.$inferInsert>,
) {
  const result = await db
    .update(playlists)
    .set(data)
    .where(eq(playlists.id, id))
    .returning();
  const playlist = result[0];

  if (!playlist) {
    throw new Error(`Playlist not found with id ${id}.`);
  }

  return playlist;
}

export async function deletePlaylist(id: number) {
  await db.delete(playlists).where(eq(playlists.id, id));
}

export async function addVideoToPlaylist(videoId: number, playlistId: number) {
  await db
    .insert(videosToPlaylists)
    .values({
      video: videoId,
      playlist: playlistId,
      addedAt: new Date().toISOString(),
    })
    .onConflictDoNothing();
}

export async function removeVideoFromPlaylist(
  videoId: number,
  playlistId: number,
) {
  await db
    .delete(videosToPlaylists)
    .where(
      and(
        eq(videosToPlaylists.video, videoId),
        eq(videosToPlaylists.playlist, playlistId),
      ),
    );
}
