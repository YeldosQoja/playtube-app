import { IAccountRepository } from "#components/account/domain/account.repository.js";
import {
  AccountId,
  AuthUserId,
} from "#components/account/domain/value-objects.js";
import { VideoId } from "#components/video/domain/value-objects.js";
import { IVideoRepository } from "#components/video/domain/video.repository.js";
import { ICommentRepository } from "./domain/comment.repository.js";
import { CommentId, Content } from "./domain/value-objects.js";

export type AddCommentDTO = {
  userId: string;
  videoId: number;
  content: string;
  parentId: number | null;
};

export type CommentDTO = {
  id: number;
  content: string;
};

export type GetCommentsInputDTO = {
  videoId: number;
  parentId?: number;
  page: number;
  perPage: number;
};

export type GetCommentsResultDTO = {
  result: CommentDTO[];
  page: number;
  perPage: number;
};

export class CommentService {
  constructor(
    private commentRepository: ICommentRepository,
    private videoRepository: IVideoRepository,
    private accountRepository: IAccountRepository,
  ) {}

  async addComment(input: AddCommentDTO): Promise<void> {
    const { userId, videoId, content, parentId } = input;
    const video = await this.videoRepository.findById(new VideoId(videoId));
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );

    const commentId = await this.commentRepository.nextId();
    const comment = video.addComment(
      commentId,
      account.getId(),
      new Content(content),
      parentId ? new CommentId(parentId) : undefined,
    );
    await this.commentRepository.add(comment);
  }

  async getComments(input: GetCommentsInputDTO): Promise<GetCommentsResultDTO> {
    const { videoId, parentId, page, perPage } = input;
    const offset = (page - 1) * perPage;
    const comments = await this.commentRepository.findMany(
      {
        videoId: new VideoId(videoId),
        parentId: parentId ? new CommentId(parentId) : null,
      },
      { offset, limit: perPage },
    );
    return {
      result: comments.map((c) => ({
        id: c.getId().value,
        content: c.getContent().value,
      })),
      page,
      perPage,
    };
  }

  async updateComment(id: number, content: string): Promise<void> {
    const comment = await this.commentRepository.findById(new CommentId(id));
    comment.updateContent(new Content(content));
    await this.commentRepository.save(comment);
  }
}
