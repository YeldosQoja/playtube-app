import type { Account } from "./account.repository.js";

export interface IAccountService {
  createAccount(
    firstName: string,
    lastName: string,
    username: string,
    authUserId: string,
    email?: string,
  ): Promise<Account>;
  getAccountById(id: number): Promise<Account>;
  getAccountByUserId(userId: string): Promise<Account>;
}
