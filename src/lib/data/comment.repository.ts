import { and, eq, isNull, sql } from "drizzle-orm";
import { AccountId } from "#components/account/domain/value-objects.js";
import {
  createComment,
  type Comment,
} from "#components/comment/domain/comment.js";
import type { ICommentRepository } from "#components/comment/domain/comment.repository.js";
import {
  CommentId,
  Content,
} from "#components/comment/domain/value-objects.js";
import type { Pagination } from "#components/shared/pagination.js";
import { VideoId } from "#components/video/domain/value-objects.js";
import { db } from "#db/index.js";
import { comments } from "#db/schema/comments.sql.js";

type CommentRecord = typeof comments.$inferSelect;

export class CommentRepository implements ICommentRepository {
  async nextId(): Promise<CommentId> {
    const { rows } = await db.execute(
      sql`SELECT nextval('comment_id_seq') AS id`,
    );
    const row = rows[0];

    if (!row) {
      throw new Error("Comment identity can't be generated.");
    }

    return new CommentId(Number(row["id"]));
  }

  async add(comment: Comment): Promise<void> {
    const snapshot = comment.toSnapshot();

    await db.insert(comments).values({
      id: snapshot.id,
      author: snapshot.authorId,
      video: snapshot.videoId,
      content: snapshot.content,
      parentComment: snapshot.parentCommentId,
      createdAt: new Date().toISOString(),
    });
  }

  async save(comment: Comment): Promise<void> {
    const snapshot = comment.toSnapshot();

    await db
      .update(comments)
      .set({
        content: snapshot.content,
      })
      .where(eq(comments.id, snapshot.id));
  }

  async findById(id: CommentId): Promise<Comment> {
    const comment = await db.query.comments.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id.value),
    });

    if (!comment) {
      throw new Error(`Comment not found with id ${id.value}.`);
    }

    return this.toDomain(comment);
  }

  async findMany(
    data: { videoId: VideoId; parentId: CommentId | null },
    pagination: Pagination,
  ): Promise<Comment[]> {
    const parentPredicate =
      data.parentId === null
        ? isNull(comments.parentComment)
        : eq(comments.parentComment, data.parentId.value);

    const rows = await db
      .select()
      .from(comments)
      .where(and(eq(comments.video, data.videoId.value), parentPredicate))
      .limit(pagination.limit)
      .offset(pagination.offset);

    return rows.map((comment) => this.toDomain(comment));
  }

  private toDomain(comment: CommentRecord): Comment {
    return createComment(
      new CommentId(comment.id),
      new AccountId(comment.author),
      new VideoId(comment.video),
      new Content(comment.content),
      comment.parentComment ? new CommentId(comment.parentComment) : null,
    );
  }
}
