import { createAccount } from "./domain/account.js";
import { IAccountRepository } from "./domain/account.repository.js";
import {
  AccountId,
  AccountName,
  AuthUserId,
  BirthDate,
  EmailAddress,
  Username,
} from "./domain/value-objects.js";

export type AccountDTO = {
  firstName: string;
  lastName: string;
  username: string;
  authUserId: string;
  birthdate: string;
  email?: string | undefined;
};

export class AccountService {
  constructor(private accountRepository: IAccountRepository) {}

  async createAccount(input: AccountDTO): Promise<void> {
    const { firstName, lastName, username, authUserId, birthdate, email } =
      input;
    const id = await this.accountRepository.nextId();
    const account = createAccount(
      id,
      new AuthUserId(authUserId),
      new AccountName(firstName),
      new AccountName(lastName),
      new Username(username),
      new BirthDate(birthdate),
      email ? new EmailAddress(email) : null,
    );
    await this.accountRepository.add(account);
  }

  async getAccountById(id: number): Promise<AccountDTO> {
    const account = await this.accountRepository.findById(new AccountId(id));

    return {
      firstName: account.getFirstName().value,
      lastName: account.getLastName().value,
      username: account.getUsername().value,
      authUserId: account.getAuthUserId().value,
      birthdate: account.getBirthdate().value.toUTCString(),
      email: account.getEmail()?.value,
    };
  }

  async getAccountByUserId(userId: string): Promise<AccountDTO> {
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );

    return {
      firstName: account.getFirstName().value,
      lastName: account.getLastName().value,
      username: account.getUsername().value,
      authUserId: account.getAuthUserId().value,
      birthdate: account.getBirthdate().value.toUTCString(),
      email: account.getEmail()?.value,
    };
  }
}
