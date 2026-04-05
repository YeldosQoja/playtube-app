import { IAuthUserRepository } from "#core/auth/auth-user.repository.js";
import { AuthUser } from "#core/auth/auth.user.js";
import { db } from "#db/index.js";
import { authUsers } from "#db/schema/auth-users.sql.js";

class AuthUserRepository implements IAuthUserRepository {
  async add(
    username: string,
    email: string | null | undefined,
    password: Buffer,
    salt: Buffer,
  ): Promise<AuthUser> {
    const result = await db
      .insert(authUsers)
      .values({
        username,
        password,
        salt,
        email,
        createdAt: new Date().toISOString(),
      })
      .returning();
    const user = result[0] as AuthUser;
    return user;
  }

  async getByUsername(username: string): Promise<AuthUser | null> {
    const user = await db.query.authUsers.findFirst({
      where: (fields, operators) => operators.eq(fields.username, username),
    });

    if (!user) {
      return null;
    }

    return user;
  }
}

export const authUserRepository = new AuthUserRepository();
