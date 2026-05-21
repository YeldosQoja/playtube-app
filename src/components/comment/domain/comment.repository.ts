import { Comment } from "./comment.js";
import type { Pagination } from "#components/shared/pagination.js";
import { CommentId } from "./value-objects.js";
import { VideoId } from "#components/video/domain/value-objects.js";

export interface ICommentRepository {
  nextId(): Promise<CommentId>;
  add(comment: Comment): Promise<void>;
  save(comment: Comment): Promise<void>;
  findById(id: CommentId): Promise<Comment>;
  findMany(
    data: { videoId: VideoId; parentId: CommentId | null },
    pagination: Pagination,
  ): Promise<Comment[]>;
}
