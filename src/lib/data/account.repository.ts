import { eq, sql } from "drizzle-orm";
import { db } from "#db/index.js";
import { accounts } from "#db/schema/accounts.sql.js";
import {
  Account,
  createAccount,
  type AccountSnapshot,
} from "#components/account/domain/account.js";
import { IAccountRepository } from "#components/account/domain/account.repository.js";
import {
  AccountId,
  AccountName,
  AuthUserId,
  BirthDate,
  EmailAddress,
  Username,
} from "#components/account/domain/value-objects.js";

type AccountRecord = typeof accounts.$inferSelect;

export class AccountRepository implements IAccountRepository {
  async nextId(): Promise<AccountId> {
    const { rows } = await db.execute(
      sql`SELECT nextval('account_id_seq') AS id`,
    );
    const row = rows[0];

    if (!row) {
      throw new Error("Identity can't be generated.");
    }

    return new AccountId(Number(row["id"]));
  }

  async add(account: Account): Promise<void> {
    const snapshot = account.toSnapshot();

    await db.insert(accounts).values({
      id: snapshot.id,
      authUser: snapshot.authUserId,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      username: snapshot.username,
      birthDate: snapshot.birthDate,
      email: snapshot.email,
      createdAt: new Date().toISOString(),
    });
  }

  async save(account: Account): Promise<void> {
    const snapshot = account.toSnapshot();
    await db
      .update(accounts)
      .set({
        authUser: snapshot.authUserId,
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        username: snapshot.username,
        birthDate: snapshot.birthDate,
        email: snapshot.email,
      })
      .where(eq(accounts.id, snapshot.id));
  }

  async findById(id: AccountId): Promise<Account> {
    const account = await db.query.accounts.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id.value),
    });

    if (!account) {
      throw new Error(`Account not found with id ${id.value}.`);
    }

    return this.toDomain(account);
  }

  async findByUserId(userId: AuthUserId): Promise<Account> {
    const account = await db.query.accounts.findFirst({
      where: (fields, operators) => operators.eq(fields.authUser, userId.value),
    });

    if (!account) {
      throw new Error(`Account not found with user id ${userId.value}.`);
    }

    return this.toDomain(account);
  }

  private toDomain(account: AccountRecord): Account {
    return createAccount(
      new AccountId(account.id),
      new AuthUserId(account.authUser),
      new AccountName(account.firstName),
      new AccountName(account.lastName),
      new Username(account.username),
      new BirthDate(account.birthDate),
      account.email ? new EmailAddress(account.email) : null,
    );
  }
}
