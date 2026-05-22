import { eq, sql } from "drizzle-orm";
import { AccountId } from "#components/account/domain/value-objects.js";
import { PlaylistId } from "#components/playlist/domain/value-objects.js";
import type { IVideoRepository } from "#components/video/domain/video.repository.js";
import { Video, type VideoSnapshot } from "#components/video/domain/video.js";
import {
  ThumbnailKey,
  type ProcessingStatusValue,
  type PublicationStatusValue,
  VideoAudience,
  VideoCategoryId,
  VideoDescription,
  VideoId,
  VideoKey,
  VideoPermissions,
  VideoPrivacy,
  type VideoPrivacyValue,
  VideoProcessingStatus,
  VideoPublicationStatus,
  VideoTag,
  VideoTitle,
} from "#components/video/domain/value-objects.js";
import { db } from "#db/index.js";
import { tags } from "#db/schema/tags.sql.js";
import { videos } from "#db/schema/videos.sql.js";
import { videosToPlaylists } from "#db/schema/videosToPlaylists.sql.js";
import { videosToTags } from "#db/schema/videosToTags.sql.js";

type VideoRecord = typeof videos.$inferSelect;
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class VideoRepository implements IVideoRepository {
  async nextId(): Promise<VideoId> {
    const { rows } = await db.execute(
      sql`SELECT nextval('video_id_seq') AS id`,
    );
    const row = rows[0];

    if (!row) {
      throw new Error("Video identity can't be generated.");
    }

    return new VideoId(Number(row["id"]));
  }

  async add(video: Video): Promise<void> {
    const snapshot = video.toSnapshot();
    const now = new Date().toISOString();

    await db.transaction(async (tx) => {
      await tx.insert(videos).values({
        ...this.toPersistence(snapshot),
        createdAt: now,
        lastUpdatedAt: now,
      });

      await this.syncPlaylist(snapshot, tx);
      await this.syncTags(snapshot, tx);
    });
  }

  async save(video: Video): Promise<void> {
    const snapshot = video.toSnapshot();
    const persistence = this.toPersistence(snapshot);
    const { id, ...data } = persistence;

    await db.transaction(async (tx) => {
      const result = await tx
        .update(videos)
        .set({
          ...data,
          lastUpdatedAt: new Date().toISOString(),
        })
        .where(eq(videos.id, id))
        .returning({ id: videos.id });

      if (!result[0]) {
        throw new Error(`Video not found with id ${id}.`);
      }

      await this.syncPlaylist(snapshot, tx);
      await this.syncTags(snapshot, tx);
    });
  }

  async deleteByKey(key: VideoKey): Promise<void> {
    await db.delete(videos).where(eq(videos.key, key.value));
  }

  async findById(id: VideoId): Promise<Video> {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id.value))
      .limit(1);
    const video = rows[0];

    if (!video) {
      throw new Error(`Video not found with id ${id.value}.`);
    }

    return await this.toDomain(video);
  }

  async findByKey(key: VideoKey): Promise<Video> {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.key, key.value))
      .limit(1);
    const video = rows[0];

    if (!video) {
      throw new Error(`Video not found with key ${key.value}.`);
    }

    return await this.toDomain(video);
  }

  async list(): Promise<Video[]> {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.publicationStatus, "published"));

    return await Promise.all(rows.map((video) => this.toDomain(video)));
  }

  private toPersistence(snapshot: VideoSnapshot) {
    return {
      id: snapshot.id,
      author: snapshot.authorId,
      key: snapshot.key,
      thumbnailKey: snapshot.thumbnailKey,
      title: snapshot.title,
      desc: snapshot.description,
      category: snapshot.categoryId,
      status: snapshot.processingStatus,
      isForKids: snapshot.isForKids,
      isAgeRestricted: snapshot.isAgeRestricted,
      allowComments: snapshot.allowComments,
      allowDownloads: snapshot.allowDownloads,
      privacy: snapshot.privacy,
      publicationStatus: snapshot.publicationStatus,
    };
  }

  private async toDomain(video: VideoRecord): Promise<Video> {
    const [playlist] = await db
      .select({ id: videosToPlaylists.playlist })
      .from(videosToPlaylists)
      .where(eq(videosToPlaylists.video, video.id))
      .limit(1);

    const videoTags = await db
      .select({ name: tags.name })
      .from(videosToTags)
      .innerJoin(tags, eq(videosToTags.tag, tags.id))
      .where(eq(videosToTags.video, video.id));

    // TODO: use different contructors based on publication status

    return new Video(
      new VideoId(video.id),
      new AccountId(video.author),
      new VideoKey(video.key),
      new VideoTitle(video.title),
      video.desc ? new VideoDescription(video.desc) : null,
      video.thumbnailKey ? new ThumbnailKey(video.thumbnailKey) : null,
      playlist ? new PlaylistId(playlist.id) : null,
      video.category ? new VideoCategoryId(video.category) : null,
      new VideoProcessingStatus(video.status as ProcessingStatusValue),
      new VideoAudience(video.isForKids, video.isAgeRestricted),
      new VideoPermissions(video.allowComments, video.allowDownloads),
      new VideoPrivacy((video.privacy ?? "private") as VideoPrivacyValue),
      new VideoPublicationStatus(
        (video.publicationStatus ?? "draft") as PublicationStatusValue,
      ),
      videoTags.map((tag) => new VideoTag(tag.name)),
    );
  }

  private async syncPlaylist(
    snapshot: VideoSnapshot,
    tx: Transaction,
  ): Promise<void> {
    if (snapshot.playlistId === null) {
      return;
    }

    await tx
      .insert(videosToPlaylists)
      .values({
        video: snapshot.id,
        playlist: snapshot.playlistId,
        addedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  }

  private async syncTags(
    snapshot: VideoSnapshot,
    tx: Transaction,
  ): Promise<void> {
    await tx.delete(videosToTags).where(eq(videosToTags.video, snapshot.id));

    const tagNames = [...new Set(snapshot.tags)];

    for (const tagName of tagNames) {
      const createdTags = await tx
        .insert(tags)
        .values({ name: tagName })
        .onConflictDoNothing()
        .returning({ id: tags.id });
      let tagId = createdTags[0]?.id;

      if (tagId === undefined) {
        const existingTags = await tx
          .select({ id: tags.id })
          .from(tags)
          .where(eq(tags.name, tagName))
          .limit(1);

        tagId = existingTags[0]?.id;
      }

      if (tagId === undefined) {
        throw new Error(`Tag ${tagName} could not be persisted.`);
      }

      await tx
        .insert(videosToTags)
        .values({
          video: snapshot.id,
          tag: tagId,
        })
        .onConflictDoNothing();
    }
  }
}
