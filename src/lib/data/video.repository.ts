import { eq, sql } from "drizzle-orm";
import { db } from "#db/index.js";
import { accounts } from "#db/schema/accounts.sql.js";
import { categories } from "#db/schema/categories.sql.js";
import { comments } from "#db/schema/comments.sql.js";
import { tags } from "#db/schema/tags.sql.js";
import { videos } from "#db/schema/videos.sql.js";
import { videosToPlaylists } from "#db/schema/videosToPlaylists.sql.js";
import { videosToTags } from "#db/schema/videosToTags.sql.js";
import type {
  CreateVideoDraftInput,
  IVideoRepository,
  UpdateVideoInput,
  VideoCategory,
  VideoDetailsRecord,
  VideoListRecord,
  VideoRecord,
  VideoTag,
} from "#core/video/video.repository.js";

const videoColumns = {
  id: videos.id,
  author: videos.author,
  key: videos.key,
  thumbnailKey: videos.thumbnailKey,
  title: videos.title,
  desc: videos.desc,
  category: videos.category,
  status: videos.status,
  isForKids: videos.isForKids,
  isAgeRestricted: videos.isAgeRestricted,
  allowComments: videos.allowComments,
  allowDownloads: videos.allowDownloads,
  privacy: videos.privacy,
  createdAt: videos.createdAt,
  lastUpdatedAt: videos.lastUpdatedAt,
};

const authorProfileColumns = {
  id: accounts.id,
  authUser: accounts.authUser,
  firstName: accounts.firstName,
  lastName: accounts.lastName,
  username: accounts.username,
};

const categoryColumns = {
  id: categories.id,
  title: categories.title,
};

function normalizeCategory(
  category: { id: number | null; title: string | null } | null,
): VideoCategory | null {
  if (!category?.id || !category.title) {
    return null;
  }

  return {
    id: category.id,
    title: category.title,
  };
}

export class VideoRepository implements IVideoRepository {
  async createDraft(data: CreateVideoDraftInput): Promise<VideoRecord> {
    const result = await db.insert(videos).values(data).returning();
    const video = result[0];

    if (!video) {
      throw new Error("Video draft could not be created.");
    }

    return video;
  }

  async updateByKey(
    key: string,
    data: UpdateVideoInput,
    playlist?: number | null,
    tagNames: string[] = [],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const result = await tx
        .update(videos)
        .set(data)
        .where(eq(videos.key, key))
        .returning();
      const video = result[0];

      if (!video) {
        throw new Error(`Video not found with key ${key}.`);
      }

      if (playlist) {
        await tx
          .insert(videosToPlaylists)
          .values({
            video: video.id,
            playlist,
            addedAt: new Date().toISOString(),
          })
          .onConflictDoNothing();
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
          const createdTags = await tx
            .insert(tags)
            .values({ name: tagName })
            .returning({
              id: tags.id,
              count: tags.count,
            });

          tag = createdTags[0];
        } else {
          await tx
            .update(tags)
            .set({
              count: sql`${tags.count} + 1`,
            })
            .where(eq(tags.name, tagName));
        }

        if (!tag) {
          throw new Error(`Tag ${tagName} could not be created.`);
        }

        await tx
          .insert(videosToTags)
          .values({
            video: video.id,
            tag: tag.id,
          })
          .onConflictDoNothing();
      }
    });
  }

  async deleteByKey(key: string): Promise<void> {
    await db.delete(videos).where(eq(videos.key, key));
  }

  async findById(id: number): Promise<VideoRecord> {
    const video = await db.query.videos.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id),
    });

    if (!video) {
      throw new Error(`Video not found with id ${id}.`);
    }

    return video;
  }

  async findByKey(key: string): Promise<VideoRecord> {
    const video = await db.query.videos.findFirst({
      where: (fields, operators) => operators.eq(fields.key, key),
    });

    if (!video) {
      throw new Error(`Video not found with key ${key}.`);
    }

    return video;
  }

  async findDetailsByKey(key: string): Promise<VideoDetailsRecord> {
    const rows = await db
      .select({
        ...videoColumns,
        authorProfile: authorProfileColumns,
        categoryInfo: categoryColumns,
      })
      .from(videos)
      .innerJoin(accounts, eq(videos.author, accounts.id))
      .leftJoin(categories, eq(videos.category, categories.id))
      .where(eq(videos.key, key))
      .limit(1);

    const row = rows[0];

    if (!row) {
      throw new Error(`Video not found with key ${key}.`);
    }

    const videoTags = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(videosToTags)
      .innerJoin(tags, eq(videosToTags.tag, tags.id))
      .where(eq(videosToTags.video, row.id));

    return {
      ...row,
      categoryInfo: normalizeCategory(row.categoryInfo),
      tags: videoTags satisfies VideoTag[],
    };
  }

  async listUploaded(): Promise<VideoListRecord[]> {
    const rows = await db
      .select({
        ...videoColumns,
        authorProfile: authorProfileColumns,
        categoryInfo: categoryColumns,
      })
      .from(videos)
      .innerJoin(accounts, eq(videos.author, accounts.id))
      .leftJoin(categories, eq(videos.category, categories.id));

    return rows.map((row) => ({
      ...row,
      categoryInfo: normalizeCategory(row.categoryInfo),
    }));
  }

  async listCategories(): Promise<VideoCategory[]> {
    return await db
      .select({ id: categories.id, title: categories.title })
      .from(categories);
  }

  async listCommentsByVideoId(
    videoId: number,
    limit: number,
    offset: number,
  ) {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.video, videoId))
      .limit(limit)
      .offset(offset);
  }
}
