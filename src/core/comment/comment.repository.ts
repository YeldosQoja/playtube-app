export interface CommentRecord {
  id: number;
  author: number;
  video: number;
  content: string;
  parentComment?: number | null;
  createdAt?: string | null;
}

export interface CreateCommentInput {
  author: number;
  video: number;
  content: string;
  parentComment?: number | null;
}

export interface ICommentRepository {
  create(data: CreateCommentInput): Promise<CommentRecord>;
  updateById(id: number, content: string): Promise<void>;
  listByVideoId(
    videoId: number,
    limit: number,
    offset: number,
  ): Promise<CommentRecord[]>;
}
