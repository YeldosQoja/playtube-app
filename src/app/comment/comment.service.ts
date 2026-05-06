import type {
  CreateCommentForVideoInput,
  ICommentService,
} from "#core/comment/comment.service.js";
import type { Account } from "#core/account/account.repository.js";
import type { ICommentRepository } from "#core/comment/comment.repository.js";
import type { IVideoRepository } from "#core/video/video.repository.js";

export class CommentService implements ICommentService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly videoRepository: IVideoRepository,
  ) {}

  async createForVideo(
    account: Account,
    data: CreateCommentForVideoInput,
  ): Promise<void> {
    const video = await this.videoRepository.findByKey(data.videoPublicKey);

    await this.commentRepository.create({
      author: account.id,
      video: video.id,
      content: data.text,
      ...(data.parentId !== undefined ? { parentComment: data.parentId } : {}),
    });
  }

  async updateById(id: number, text: string): Promise<void> {
    await this.commentRepository.updateById(id, text);
  }
}
