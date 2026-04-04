import { promisify } from "node:util";
import { pbkdf2, timingSafeEqual } from "node:crypto";
import { AuthUser, Credentials, IAuthStrategy } from "#app/auth/auth.model.js";
import { db } from "#db/index.js";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

const pbkdf2Async = promisify(pbkdf2);

export interface SessionCredentials extends Credentials {
  username: string;
  password: string;
}

const ITERATIONS = parseInt(process.env["ITERATIONS"] || "100000");

export class SessionStrategy implements IAuthStrategy<SessionCredentials> {
  async authenticate(
    credentials: SessionCredentials,
  ): Promise<AuthUser | null> {
    const { username, password } = credentials;
    const user = await db.query.users.findFirst({
      where: (fields, operators) => operators.eq(fields.username, username),
    });

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

  refresh(token: string): Promise<string | null> {
    return Promise.resolve(null);
  }

  revoke(token: string): Promise<void> {
    return Promise.resolve();
  }
}
