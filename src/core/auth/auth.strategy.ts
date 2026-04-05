import { AuthUser } from "./auth.user.js";

export interface Credentials {
  [key: string]: unknown;
}

export interface IAuthStrategy<C extends Credentials = Credentials> {
  authenticate(credentials: C): Promise<AuthUser>;

  register(credentials: C): Promise<AuthUser>;

  revoke(token: string): Promise<void>;

  refresh(token: string): Promise<string | null>;
}
