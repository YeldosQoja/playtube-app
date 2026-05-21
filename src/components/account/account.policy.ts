import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { Account } from "./domain/account.js";

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
