import { IAccountRepository } from "#core/account/account.repository.js";

export class AccountService {
  private repository: IAccountRepository;

  constructor(repository: IAccountRepository) {
    this.repository = repository;
  }

  async createAccount(
    firstName: string,
    lastName: string,
    username: string,
    authUserId: string,
    email?: string,
  ) {
    const newAccount = await this.repository.createAccount(
      firstName,
      lastName,
      username,
      authUserId,
      email,
    );
    return newAccount;
  }

  async getAccountById(id: number) {
    const account = await this.repository.getAccountById(id);
    return account;
  }

  async getAccountByUserId(userId: string) {
    const account = await this.repository.getAccountByUserId(userId);
    return account;
  }
}
