import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function ensureCanManageVideo(account: unknown, video: unknown): void {
  const accountId = (account as { id?: number }).id;
  const authorId = (video as { author?: number }).author;

  if (
    accountId === undefined ||
    authorId === undefined ||
    authorId !== accountId
  ) {
    throw new AppError(
      "You are not authorized to manage this video.",
      HttpStatusCode.FORBIDDEN,
      false,
    );
  }
}
