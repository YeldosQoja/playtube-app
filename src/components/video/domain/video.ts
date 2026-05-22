import { AccountId } from "#components/account/domain/value-objects.js";
import { Comment } from "#components/comment/domain/comment.js";
import {
  CommentId,
  Content,
} from "#components/comment/domain/value-objects.js";
import { PlaylistId } from "#components/playlist/domain/value-objects.js";
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
  VideoTagName,
  VideoTitle,
} from "./value-objects.js";

export interface VideoSnapshot {
  id: number;
  authorId: number;
  key: string;
  title: string;
  description: string | null;
  thumbnailKey: string | null;
  playlistId: number | null;
  categoryId: number | null;
  processingStatus: ProcessingStatusValue;
  isForKids: boolean;
  isAgeRestricted: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
  privacy: VideoPrivacyValue;
  publicationStatus: PublicationStatusValue;
  tags: string[];
}

// Consistency rules

export class Video {
  private id: VideoId;
  private authorId: AccountId;
  private key: VideoKey;
  private title: VideoTitle;
  private description: VideoDescription | null;
  private thumbnailKey: ThumbnailKey | null;
  private playlistId: PlaylistId | null;
  private categoryId: VideoCategoryId | null;
  private processingStatus: VideoProcessingStatus;
  private audience: VideoAudience;
  private permissions: VideoPermissions;
  private privacy: VideoPrivacy;
  private publicationStatus: VideoPublicationStatus;
  private tags: VideoTagName[];

  public getId() {
    return this.id;
  }

  public getAuthorId() {
    return this.authorId;
  }

  public getThumbnailKey() {
    return this.thumbnailKey;
  }

  constructor(
    id: VideoId,
    authorId: AccountId,
    key: VideoKey,
    title: VideoTitle,
  );

  constructor(
    id: VideoId,
    authorId: AccountId,
    key: VideoKey,
    title: VideoTitle,
    description: VideoDescription | null,
    thumbnailKey: ThumbnailKey,
    playlistId: PlaylistId | null,
    categoryId: VideoCategoryId,
    processingStatus: VideoProcessingStatus,
    audience: VideoAudience,
    permissions: VideoPermissions,
    privacy: VideoPrivacy,
    publicationStatus: VideoPublicationStatus,
    tags?: VideoTagName[],
  );

  constructor(
    id: VideoId,
    authorId: AccountId,
    key: VideoKey,
    title: VideoTitle,
    description?: VideoDescription | null,
    thumbnailKey?: ThumbnailKey,
    playlistId?: PlaylistId | null,
    categoryId?: VideoCategoryId | null,
    processingStatus?: VideoProcessingStatus,
    audience?: VideoAudience,
    permissions?: VideoPermissions,
    privacy?: VideoPrivacy,
    publicationStatus?: VideoPublicationStatus,
    tags: VideoTagName[] = [],
  ) {
    if (description === undefined) {
      this.id = id;
      this.authorId = authorId;
      this.key = key;
      this.title = title;
      this.description = null;
      this.thumbnailKey = null;
      this.categoryId = null;
      this.playlistId = null;
      this.processingStatus = new VideoProcessingStatus("PENDING_UPLOAD");
      this.audience = new VideoAudience(false, false);
      this.permissions = new VideoPermissions(true, false);
      this.privacy = new VideoPrivacy("private");
      this.publicationStatus = new VideoPublicationStatus("draft");
      this.tags = [];
      return;
    }

    if (
      thumbnailKey === undefined ||
      categoryId === undefined ||
      processingStatus === undefined ||
      audience === undefined ||
      permissions === undefined ||
      privacy === undefined ||
      publicationStatus === undefined
    ) {
      throw new Error(
        "Complete video metadata is required for reconstitution.",
      );
    }

    this.id = id;
    this.authorId = authorId;
    this.key = key;
    this.title = title;
    this.description = description ?? null;
    this.thumbnailKey = thumbnailKey;
    this.categoryId = categoryId ?? null;
    this.playlistId = playlistId ?? null;
    this.processingStatus = processingStatus;
    this.audience = audience;
    this.permissions = permissions;
    this.privacy = privacy;
    this.publicationStatus = publicationStatus;
    this.tags = tags;
  }

  isOwnedBy(accountId: AccountId) {
    return this.authorId.isEqual(accountId);
  }

  markProcessingComplete() {
    this.processingStatus = new VideoProcessingStatus("READY");
    this.tryPublish();
  }

  saveMetadata(
    title: VideoTitle,
    description: VideoDescription | null,
    thumbnailKey: ThumbnailKey,
    playlistId: PlaylistId | null,
    categoryId: VideoCategoryId,
    audience: VideoAudience,
    permissions: VideoPermissions,
    privacy: VideoPrivacy,
    tags: VideoTagName[] = [],
  ) {
    this.title = title;
    this.description = description;
    this.thumbnailKey = thumbnailKey;
    this.playlistId = playlistId;
    this.categoryId = categoryId;
    this.audience = audience;
    this.permissions = permissions;
    this.privacy = privacy;
    this.tags = tags;

    this.tryPublish();
  }

  private tryPublish() {
    if (this.processingStatus.isReady() && this.hasRequiredMetadata()) {
      this.publicationStatus = new VideoPublicationStatus("published");
    }
  }

  private hasRequiredMetadata(): boolean {
    return this.thumbnailKey !== null;
    // any other required fields
  }

  addComment(
    commentId: CommentId,
    authorId: AccountId,
    content: Content,
    parentId?: CommentId,
  ): Comment {
    if (!this.publicationStatus.isPublished()) {
      throw new Error("Comment can't be added on unpublished video.");
    }

    if (!this.permissions.canComment()) {
      throw new Error("Comments are disabled for this video.");
    }

    const comment = new Comment(
      commentId,
      authorId,
      this.id,
      content,
      parentId ?? null,
    );

    return comment;
  }

  toSnapshot(): VideoSnapshot {
    return {
      id: this.id.value,
      authorId: this.authorId.value,
      key: this.key.value,
      title: this.title.value,
      description: this.description?.value ?? null,
      thumbnailKey: this.thumbnailKey?.value ?? null,
      playlistId: this.playlistId?.value ?? null,
      categoryId: this.categoryId?.value ?? null,
      processingStatus: this.processingStatus.value,
      isForKids: this.audience.isForKids,
      isAgeRestricted: this.audience.isAgeRestricted,
      allowComments: this.permissions.allowComments,
      allowDownloads: this.permissions.allowDownloads,
      privacy: this.privacy.value,
      publicationStatus: this.publicationStatus.value,
      tags: this.tags.map((tag) => tag.value),
    };
  }
}
