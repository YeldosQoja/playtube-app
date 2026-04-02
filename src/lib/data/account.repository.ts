import { db } from "#db/index.js";
import { users } from "#db/schema/users.sql.js";
import { Account, IAccountRepository } from "#app/account/account.model.js";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

class AccountRepository implements IAccountRepository {
  async createAccount(
    firstName: string,
    lastName: string,
    username: string,
    email: string | null,
  ): Promise<Account> {
    const result = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date().toISOString(),
        // TODO: we remove user creds from users table later
        password: Buffer.from([]),
        salt: Buffer.from([]),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      });

    if (!result[0]) {
      throw new AppError("", HttpStatusCode.SERVER_ERROR);
    }

    return result[0];
  }

  async getAccountById(accountId: number): Promise<Account> {
    const user = await db.query.users.findFirst({
      where: (fields, operators) => operators.eq(fields.id, accountId),
    });

    if (!user) {
      throw new Error(`User not found with id ${accountId}`);
    }

    return user;
  }
}

export const repository = new AccountRepository();
