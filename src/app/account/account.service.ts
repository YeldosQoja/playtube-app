import { IAccountRepository } from "./account.model.js";

export class AccountService {
  private repository: IAccountRepository;

  constructor(repository: IAccountRepository) {
    this.repository = repository;
  }

  async createAccount(
    firstName: string,
    lastName: string,
    username: string,
    email: string | null,
  ) {
    const newAccount = await this.repository.createAccount(
      firstName,
      lastName,
      username,
      email,
    );
    return newAccount;
  }

  async getAccountById(id: number) {
    const account = await this.repository.getAccountById(id);
    return account;
  }
}
