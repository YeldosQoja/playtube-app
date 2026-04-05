import { promisify } from "node:util";
import { pbkdf2, timingSafeEqual, randomBytes } from "node:crypto";
import { Credentials, IAuthStrategy } from "#core/auth/auth.strategy.js";
import { AuthUser } from "#core/auth/auth.user.js";
import { IAuthUserRepository } from "#core/auth/auth-user.repository.js";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

const pbkdf2Async = promisify(pbkdf2);

export interface SessionCredentials extends Credentials {
  username: string;
  password: string;
  email?: string | null;
}

const ITERATIONS = parseInt(process.env["ITERATIONS"] || "100000");

export class SessionStrategy implements IAuthStrategy<SessionCredentials> {
  private authUserRepository: IAuthUserRepository;

  constructor(authUserRepository: IAuthUserRepository) {
    this.authUserRepository = authUserRepository;
  }

  async authenticate(credentials: SessionCredentials): Promise<AuthUser> {
    const { username, password } = credentials;

    const user = await this.authUserRepository.getByUsername(username);

    if (!user) {
      throw new AppError(
        "Username or password is incorrect.",
        HttpStatusCode.UNAUTHORIZED,
        false,
      );
    }
    const { salt } = user;
    const hashedPassword = await pbkdf2Async(
      password,
      salt,
      ITERATIONS,
      32,
      "sha256",
    );
    if (!timingSafeEqual(user.password, hashedPassword)) {
      throw new AppError(
        "Username or password is incorrect.",
        HttpStatusCode.UNAUTHORIZED,
        false,
      );
    }

    return user;
  }

  async register(credentials: SessionCredentials): Promise<AuthUser> {
    const { username, password, email } = credentials;

    const salt = randomBytes(16);
    const hashedPassword = await pbkdf2Async(
      password,
      salt,
      ITERATIONS,
      32,
      "sha256",
    );

    const user = await this.authUserRepository.add(
      username,
      email,
      hashedPassword,
      salt,
    );
    return user;
  }

  refresh(token: string): Promise<string | null> {
    return Promise.resolve(null);
  }

  revoke(token: string): Promise<void> {
    return Promise.resolve();
  }
}
