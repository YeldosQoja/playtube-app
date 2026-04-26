import type { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";
import { AuthService } from "./auth.service.js";

export function createAuthController(authService: AuthService) {
  return {
    async signIn(req: Request, res: Response) {
      const username = req.user?.username;
      res
        .status(HttpStatusCode.OK)
        .send({ msg: `Successfully signed into ${username}` });
    },
    async signUp(req: Request, res: Response, next: NextFunction) {
      const { firstName, lastName, username, email, password } = req.body;

      const user = await authService.register("session", {
        firstName,
        lastName,
        username,
        email,
        password,
      });

      logger.info({ user }, "Account created successfully.");

      logger.debug({ session: req.session }, "Session before login");

      req.login(user as Express.User, (err) => {
        if (err) {
          return next(err);
        }
        logger.debug({ session: req.session }, "Session after login");
        res
          .status(HttpStatusCode.OK)
          .send({ user, msg: "Account created successfully." });
      });
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
