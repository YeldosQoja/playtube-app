import { IAuthStrategy, Credentials } from "./auth.strategy.js";

export class AuthUser {
  private id?: string | undefined;
  private externalId?: string | undefined;
  private email?: string | undefined;

  private observers: Set<IAuthUserObserver> = new Set();
  private strategy: IAuthStrategy;

  constructor(strategy: IAuthStrategy) {
    this.strategy = strategy;
  }

  attach(observer: IAuthUserObserver) {
    this.observers.add(observer);
  }

  private notify() {
    this.observers.forEach((o) => {
      o.update();
    });
  }

  async authenticate(credentials: Credentials) {
    const authUser = await this.strategy.authenticate(credentials);
    this.id = authUser?.id;
    this.externalId = authUser?.externalId;
    this.email = authUser?.email;
    this.notify();
  }

  getState() {
    return {
      id: this.id,
      payload: {},
    };
  }
}

export interface IAuthUserObserver {
  authUser?: AuthUser;
  update(): void;
}
