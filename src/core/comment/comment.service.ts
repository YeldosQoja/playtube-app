import type { Account } from "#core/account/account.repository.js";

export interface CreateCommentForVideoInput {
  videoPublicKey: string;
  text: string;
  parentId?: number | null;
}

export interface ICommentService {
  createForVideo(
    account: Account,
    data: CreateCommentForVideoInput,
  ): Promise<void>;
  updateById(id: number, text: string): Promise<void>;
}
