export interface Account {
  id: number;
  authUser: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  username: string;
}

export interface IAccountRepository {
  createAccount(
    firstName: string,
    lastName: string,
    username: string,
    authUserId: string,
    email?: string,
  ): Promise<Account>;
  getAccountById(accountId: number): Promise<Account>;
  getAccountByUserId(userId: string): Promise<Account>;
}
