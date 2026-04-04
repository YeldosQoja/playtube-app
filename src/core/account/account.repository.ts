export interface Account {
  id: number;
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
    authUserId: number,
    email?: string,
  ): Promise<Account>;
  getAccountById(accountId: number): Promise<Account>;
}
