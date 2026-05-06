import { eq } from "drizzle-orm";
import { db } from "#db/index.js";
import { comments } from "#db/schema/comments.sql.js";
import type {
  CommentRecord,
  CreateCommentInput,
  ICommentRepository,
} from "#core/comment/comment.repository.js";

export class CommentRepository implements ICommentRepository {
  async create(data: CreateCommentInput): Promise<CommentRecord> {
    const result = await db.insert(comments).values(data).returning();
    const comment = result[0];

    if (!comment) {
      throw new Error("Comment could not be created.");
    }

    return comment;
  }

  async updateById(id: number, content: string): Promise<void> {
    await db.update(comments).set({ content }).where(eq(comments.id, id));
  }

  async listByVideoId(
    videoId: number,
    limit: number,
    offset: number,
  ): Promise<CommentRecord[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.video, videoId))
      .limit(limit)
      .offset(offset);
  }
}
