import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function ensureCanManagePlaylist(
  account: unknown,
  playlist: unknown,
): void {
  const accountId = (account as { id?: number }).id;
  const authorId = (playlist as { author?: number }).author;

  if (
    accountId === undefined ||
    authorId === undefined ||
    authorId !== accountId
  ) {
    throw new AppError(
      "You are not authorized to manage this playlist.",
      HttpStatusCode.FORBIDDEN,
      false,
    );
  }
}
