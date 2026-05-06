import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import type { Account } from "#core/account/account.repository.js";
import type { VideoRecord } from "./video.repository.js";

export function ensureCanManageVideo(account: Account, video: VideoRecord) {
  if (video.author !== account.id) {
    throw new AppError(
      "You are not authorized to manage this video.",
      HttpStatusCode.FORBIDDEN,
      false,
    );
  }
}
