import { AccountId } from "#components/account/domain/value-objects.js";
import { VideoId } from "#components/video/domain/value-objects.js";
import { CommentId, Content } from "./value-objects.js";

export interface CommentSnapshot {
  id: number;
  authorId: number;
  videoId: number;
  content: string;
  parentCommentId: number | null;
}

// Comment Aggregate
// In order to maintain invariants (consistency rules) within Comment Aggregate
export class Comment {
  constructor(
    private id: CommentId,
    private authorId: AccountId,
    private videoId: VideoId,
    private content: Content,
    private parentCommentId: CommentId | null,
  ) {}

  public getId() {
    return this.id;
  }

  public getContent() {
    return this.content;
  }

  updateContent(content: Content) {
    this.content = content;
  }

  toSnapshot(): CommentSnapshot {
    return {
      id: this.id.value,
      authorId: this.authorId.value,
      videoId: this.videoId.value,
      content: this.content.value,
      parentCommentId: this.parentCommentId?.value ?? null,
    };
  }
}

export const createComment = (
  id: CommentId,
  authorId: AccountId,
  videoId: VideoId,
  content: Content,
  parentCommentId: CommentId | null = null,
): Comment => {
  return new Comment(id, authorId, videoId, content, parentCommentId);
};
