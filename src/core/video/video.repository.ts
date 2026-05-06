import type { CommentRecord } from "#core/comment/comment.repository.js";

export type VideoPrivacy = "public" | "private" | "unlisted";

export interface VideoCategory {
  id: number;
  title: string;
}

export interface VideoTag {
  id: number;
  name: string;
}

export interface VideoAuthorProfile {
  id: number;
  authUser: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface VideoRecord {
  id: number;
  author: number;
  key: string;
  thumbnailKey?: string | null;
  title: string;
  desc?: string | null;
  category?: number | null;
  status: string;
  isForKids?: boolean | null;
  isAgeRestricted?: boolean | null;
  allowComments?: boolean | null;
  allowDownloads?: boolean | null;
  privacy?: VideoPrivacy | null;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface VideoListRecord extends VideoRecord {
  authorProfile: VideoAuthorProfile;
  categoryInfo: VideoCategory | null;
}

export interface VideoDetailsRecord extends VideoListRecord {
  tags: VideoTag[];
}

export interface CreateVideoDraftInput {
  author: number;
  key: string;
  title: string;
  privacy: VideoPrivacy;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface UpdateVideoInput {
  thumbnailKey?: string | null;
  title?: string;
  desc?: string | null;
  category?: number | null;
  status?: string;
  isForKids?: boolean | null;
  isAgeRestricted?: boolean | null;
  allowComments?: boolean | null;
  allowDownloads?: boolean | null;
  privacy?: VideoPrivacy | null;
  lastUpdatedAt?: string;
}

export interface IVideoRepository {
  createDraft(data: CreateVideoDraftInput): Promise<VideoRecord>;
  updateByKey(
    key: string,
    data: UpdateVideoInput,
    playlist?: number | null,
    tagNames?: string[],
  ): Promise<void>;
  deleteByKey(key: string): Promise<void>;
  findById(id: number): Promise<VideoRecord>;
  findByKey(key: string): Promise<VideoRecord>;
  findDetailsByKey(key: string): Promise<VideoDetailsRecord>;
  listUploaded(): Promise<VideoListRecord[]>;
  listCategories(): Promise<VideoCategory[]>;
  listCommentsByVideoId(
    videoId: number,
    limit: number,
    offset: number,
  ): Promise<CommentRecord[]>;
}
