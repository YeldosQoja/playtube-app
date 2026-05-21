import { AccountId } from "#components/account/domain/value-objects.js";
import { VideoId } from "#components/video/domain/value-objects.js";
import {
  LastUpdatedAt,
  PlaylistDescription,
  PlaylistId,
  PlaylistThumbnailKey,
  PlaylistTitle,
} from "./value-objects.js";

export interface PlaylistSnapshot {
  id: number;
  authorId: number;
  title: string;
  description: string | null;
  thumbnailKey: string;
  lastUpdatedAt: string;
  videoIds: number[];
}

export class Playlist {
  constructor(
    private id: PlaylistId,
    private authorId: AccountId,
    private title: PlaylistTitle,
    private description: PlaylistDescription | null,
    private thumbnailKey: PlaylistThumbnailKey,
    private lastUpdatedAt: LastUpdatedAt,
    private videoIds: VideoId[] = [],
  ) {
    this.ensureUniqueVideos(videoIds);
  }

  public getId() {
    return this.id;
  }

  public getTitle() {
    return this.title;
  }

  public getDesc() {
    return this.description;
  }

  public getThumbnailKey() {
    return this.thumbnailKey;
  }

  public getLastUpdatedAt() {
    return this.lastUpdatedAt;
  }

  public getVideoCount() {
    return this.videoIds.length;
  }

  isOwnedBy(accountId: AccountId): boolean {
    return this.authorId.isEqual(accountId);
  }

  updateTitle(title: PlaylistTitle): void {
    this.title = title;

    this.lastUpdatedAt = new LastUpdatedAt();
  }

  updateDescription(description: PlaylistDescription | null): void {
    this.description = description;

    this.lastUpdatedAt = new LastUpdatedAt();
  }

  updateThumbnail(thumbnailKey: PlaylistThumbnailKey): void {
    this.thumbnailKey = thumbnailKey;

    this.lastUpdatedAt = new LastUpdatedAt();
  }

  addVideo(videoId: VideoId): void {
    if (this.hasVideo(videoId)) {
      throw new Error("Video is already in playlist.");
    }

    this.videoIds.push(videoId);

    this.lastUpdatedAt = new LastUpdatedAt();
  }

  removeVideo(videoId: VideoId): void {
    if (!this.hasVideo(videoId)) {
      throw new Error("Video is not in playlist.");
    }

    this.videoIds = this.videoIds.filter((existingVideoId) => {
      return !existingVideoId.isEqual(videoId);
    });

    this.lastUpdatedAt = new LastUpdatedAt();
  }

  toSnapshot(): PlaylistSnapshot {
    return {
      id: this.id.value,
      authorId: this.authorId.value,
      title: this.title.value,
      description: this.description?.value ?? null,
      thumbnailKey: this.thumbnailKey.value,
      lastUpdatedAt: this.lastUpdatedAt.value,
      videoIds: this.videoIds.map((videoId) => videoId.value),
    };
  }

  private hasVideo(videoId: VideoId): boolean {
    return this.videoIds.some((existingVideoId) => {
      return existingVideoId.isEqual(videoId);
    });
  }

  private ensureUniqueVideos(videoIds: VideoId[]): void {
    const uniqueVideoIds = new Set<number>();

    for (const videoId of videoIds) {
      const value = videoId.toNumber();

      if (uniqueVideoIds.has(value)) {
        throw new Error("Playlist can't contain duplicate videos.");
      }

      uniqueVideoIds.add(value);
    }
  }
}

export const createPlaylist = (
  id: PlaylistId,
  authorId: AccountId,
  title: PlaylistTitle,
  description: PlaylistDescription | null,
  thumbnailKey: PlaylistThumbnailKey,
  lastUpdatedAt: LastUpdatedAt = new LastUpdatedAt(),
  videoIds: VideoId[] = [],
): Playlist => {
  return new Playlist(
    id,
    authorId,
    title,
    description,
    thumbnailKey,
    lastUpdatedAt,
    videoIds,
  );
};
