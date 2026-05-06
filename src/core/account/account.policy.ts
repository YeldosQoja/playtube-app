import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import type { Account } from "./account.repository.js";

export function requireAccount(account: Account | undefined): Account {
  if (!account) {
    throw new AppError(
      "Account profile is required for this operation.",
      HttpStatusCode.FORBIDDEN,
      false,
    );
  }

  return account;
}
