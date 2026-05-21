import type { Account } from "./account.js";
import { AccountId, AuthUserId } from "./value-objects.js";

export interface IAccountRepository {
  nextId(): Promise<AccountId>;
  add(account: Account): Promise<void>;
  save(account: Account): Promise<void>;
  findById(id: AccountId): Promise<Account>;
  findByUserId(userId: AuthUserId): Promise<Account>;
}
