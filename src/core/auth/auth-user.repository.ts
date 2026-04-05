import { AuthUser } from "./auth.user.js";

export interface IAuthUserRepository {
  add(
    username: string,
    email: string | null | undefined,
    password: Buffer,
    salt: Buffer,
  ): Promise<AuthUser>;
  getByUsername(username: string): Promise<AuthUser | null>;
}
