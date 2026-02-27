import type { DrizzleError } from "drizzle-orm";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "./index.js";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";
import AppError from "../utils/AppError.js";
import { videos } from "./schema/videos.sql.js";
import { comments } from "./schema/comments.sql.js";
import { users } from "./schema/users.sql.js";
import { tags } from "./schema/tags.sql.js";
import { videosToPlaylists } from "./schema/videosToPlaylists.sql.js";
import { videosToTags } from "./schema/videosToTags.sql.js";
import { nanoid } from "nanoid";

export async function findVideoByKey(key: string) {
  try {
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
      throw new AppError(
        `Video not found with key ${key}.`,
        HttpStatusCode.NOT_FOUND,
        true,
      );
    }
    return video;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: finding video by key ${key} failed. Error message: ${
        (err as DrizzleError).message
      }`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function getUploadedVideos() {
  try {
    const result = await db.query.videos.findMany({
      where: ({ status }, { eq }) => eq(status, "UPLOADED"),
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
    return result;
  } catch (err) {
    throw new AppError(
      `DB Error: failed to get a list of updated videos.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function updateVideo(
  key: string,
  data: Partial<typeof videos.$inferSelect>,
  playlist: number,
  tagNames: string[],
) {
  try {
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
  } catch (err) {
    throw new AppError(
      `DB Error: update video with key ${key} failed. ${(err as DrizzleError).message}`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function deleteVideo(key: string) {
  try {
    await db.delete(videos).where(eq(videos.key, key));
  } catch (err) {
    throw new AppError(
      `DB Error: delete video with key ${key} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function createVideoDraft(
  data: typeof videos.$inferInsert,
  playlist?: number,
  tagNames?: string[],
) {
  try {
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
  } catch (err) {
    throw new AppError(
      `DB Error: create video transaction failed. Error Message: ${
        (err as DrizzleError).message
      }`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function updateVideoStatus(key: string, status: string) {
  try {
    await db.update(videos).set({ status }).where(eq(videos.key, key));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: failed to change video key: ${key} status to ${status}: ${
        (err as DrizzleError).message
      }`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function updateStatusForMultipleVideos(
  keys: string[],
  status: string,
) {
  try {
    await db.update(videos).set({ status }).where(inArray(videos.key, keys));
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: failed to update status for multiple videos: ${
        (err as DrizzleError).message
      }`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function findVideoById(id: number) {
  try {
    const video = await db.query.videos.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id),
    });
    if (!video) {
      throw new AppError(
        `Video not found with id ${id}.`,
        HttpStatusCode.NOT_FOUND,
        true,
      );
    }
    return video;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: finding video by id ${id} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

// Comments queries
export async function createComment(
  data: Omit<typeof comments.$inferInsert, "id" | "createdAt">,
) {
  try {
    const result = await db.insert(comments).values(data).returning();
    return result[0];
  } catch (err) {
    throw new AppError(
      `DB Error: create comment failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function updateComment(id: number, content: string) {
  try {
    await db.update(comments).set({ content }).where(eq(comments.id, id));
  } catch (err) {
    throw new AppError(
      `DB Error: update comment with id ${id} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function getCommentsByVideoId(
  videoId: number,
  limit: number,
  offset: number = 0,
) {
  try {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.video, videoId))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (err) {
    throw new AppError(
      `DB Error: get comments for video ${videoId} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

// Users queries
export async function findUserByUsername(username: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (fields, operators) => operators.eq(fields.username, username),
    });
    if (!user) {
      throw new AppError(
        `There is no such user ${username}`,
        HttpStatusCode.NOT_FOUND,
        true,
      );
    }
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: finding user by username ${username} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function findUserById(id: number) {
  try {
    const user = await db.query.users.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id),
    });
    if (!user) {
      throw new AppError(
        `User not found with id ${id}`,
        HttpStatusCode.NOT_FOUND,
        true,
      );
    }
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      `DB Error: finding user by id ${id} failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}

export async function createUser(
  data: Omit<typeof users.$inferInsert, "id" | "createdAt">,
) {
  try {
    const result = await db
      .insert(users)
      .values(data)
      .returning({ id: users.id, username: users.username });
    return result[0];
  } catch (err) {
    console.log(err);
    throw new AppError(
      `DB Error: create user failed.`,
      HttpStatusCode.SERVER_ERROR,
      false,
    );
  }
}
