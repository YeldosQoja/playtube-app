import { Credentials, IAuthStrategy } from "#core/auth/auth.strategy.js";
import { IAccountRepository } from "#core/account/account.repository.js";

export class AuthService {
  private strategies = new Map<string, IAuthStrategy>();
  private accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  addStrategy(name: string, strategy: IAuthStrategy) {
    this.strategies.set(name, strategy);
    return this;
  }

  private get(name: string): IAuthStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) throw new Error(`Unknown auth strategy: ${name}`);
    return strategy;
  }

  async authenticate(strategy: string, credentials: Credentials) {
    return await this.get(strategy).authenticate(credentials);
  }

  async register(strategy: string, credentials: Credentials) {
    const authUser = await this.get(strategy).register(credentials);

    const { firstName, lastName, username, email } = credentials;

    await this.accountRepository.createAccount(
      // @ts-ignore
      firstName,
      lastName,
      username,
      authUser.id,
      email,
    );

    return authUser;
  }

  async revoke(strategy: string, token: string) {
    return this.get(strategy).revoke(token);
  }

  async refresh(strategy: string, token: string) {
    return this.get(strategy).refresh(token);
  }
}
