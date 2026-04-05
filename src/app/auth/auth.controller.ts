import type { RequestHandler } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";
import { AuthService } from "./auth.service.js";
import { repository as accountRepository } from "#lib/data/account.repository.js";
import { SessionStrategy } from "#lib/auth/session-strategy.js";
import { authUserRepository } from "#lib/data/auth.repository.js";

const authService = new AuthService(accountRepository).addStrategy(
  "session",
  new SessionStrategy(authUserRepository),
);

let passportConfigured = false;

export function configurePassport() {
  if (passportConfigured) {
    return;
  }

  passport.use(
    new LocalStrategy(async (username, password, cb) => {
      try {
        const user = await authService.authenticate("session", {
          username,
          password,
        });
        return cb(null, user);
      } catch (err) {
        return cb(err, false);
      }
    }),
  );

  passport.serializeUser((user, cb) => {
    process.nextTick(() => {
      cb(null, user.username);
    });
  });

  passport.deserializeUser((username: string, cb) => {
    process.nextTick(async () => {
      try {
        const user = await authUserRepository.getByUsername(username);
        cb(null, user);
      } catch (err) {
        logger.info(
          "Invalid cookies provided. Unable to authenticate the request.",
        );
        cb(err, null);
      }
    });
  });

  passportConfigured = true;
}

export const signIn: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "local",
    (err: unknown, user: Express.User, info: unknown, status: number) => {
      if (err) {
        return next(err);
      }
      req.login(user, (loginError) => {
        if (loginError) {
          next(loginError);
          return;
        }
        logger.info({ user }, "User has logged in.");
        res.status(HttpStatusCode.OK).json({ msg: "Login successful!" });
      });
    },
  )(req, res, next);
};

export const signUp: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;

  const user = await authService.register("session", {
    firstName,
    lastName,
    username,
    email,
    password,
  });

  req.login(user as Express.User, (err) => {
    if (err) {
      return next(err);
    }
    logger.info({ user }, "Account created successfully.");
    res
      .status(HttpStatusCode.OK)
      .json({ user, msg: "Account created successfully." });
  });
};
