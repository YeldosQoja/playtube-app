export interface Account {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string | null;
}

export interface IAccountRepository {
  createAccount(
    firstName: string,
    lastName: string,
    username: string,
    email: string | null,
  ): Promise<Account>;
  getAccountById(accountId: number): Promise<Account>;
}
