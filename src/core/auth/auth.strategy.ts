export type IAuthUser = {
  id?: string;
  externalId?: string;
  email?: string;
};

export interface Credentials {
  [key: string]: unknown;
}

export interface IAuthStrategy<C extends Credentials = Credentials> {
  authenticate(credentials: C): Promise<IAuthUser | null>;

  revoke(token: string): Promise<void>;

  refresh(token: string): Promise<string | null>;
}
