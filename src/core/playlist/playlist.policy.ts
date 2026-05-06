import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import type { Account } from "#core/account/account.repository.js";
import type { PlaylistRecord } from "./playlist.repository.js";

export function ensureCanManagePlaylist(
  account: Account,
  playlist: PlaylistRecord,
) {
  if (playlist.author !== account.id) {
    throw new AppError(
      "You are not authorized to manage this playlist.",
      HttpStatusCode.FORBIDDEN,
      false,
    );
  }
}
