import { db } from "#db/index.js";
import { accounts } from "#db/schema/accounts.sql.js";
import {
  Account,
  IAccountRepository,
} from "#core/account/account.repository.js";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

class AccountRepository implements IAccountRepository {
  async createAccount(
    firstName: string,
    lastName: string,
    username: string,
    authUserId: number,
    email?: string,
  ): Promise<Account> {
    const res = await db
      .insert(accounts)
      .values({
        firstName,
        lastName,
        authUser: authUserId,
        username,
        email,
        createdAt: new Date().toISOString(),
      })
      .returning();

    if (!res[0]) {
      throw new AppError("", HttpStatusCode.SERVER_ERROR);
    }

    return res[0];
  }

  async getAccountById(accountId: number): Promise<Account> {
    const account = await db.query.accounts.findFirst({
      where: (fields, operators) => operators.eq(fields.id, accountId),
    });

    if (!account) {
      throw new Error(`User not found with id ${accountId}`);
    }

    return account;
  }
}

export const repository = new AccountRepository();
