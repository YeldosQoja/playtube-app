import { AccountId } from "#components/account/domain/value-objects.js";
import {
  ThumbnailKey,
  VideoAudience,
  VideoCategoryId,
  VideoDescription,
  VideoId,
  VideoKey,
  VideoPermissions,
  VideoPrivacy,
  VideoProcessingStatus,
  VideoPublicationStatus,
  VideoTagName,
  VideoTitle,
} from "./value-objects.js";
import { Video } from "./video.js";

export class VideoFactory {
  create(
    id: VideoId,
    authorId: AccountId,
    key: VideoKey,
    title: VideoTitle,
    description?: VideoDescription | null,
    thumbnailKey?: ThumbnailKey,
    categoryId?: VideoCategoryId,
    processingStatus?: VideoProcessingStatus,
    audience?: VideoAudience,
    permissions?: VideoPermissions,
    privacy?: VideoPrivacy,
    publicationStatus?: VideoPublicationStatus,
    tags: VideoTagName[] = [],
  ) {
    const video = new Video(id, authorId, key, title);
    return video;
  }
}
