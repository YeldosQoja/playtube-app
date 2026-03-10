import type { RequestHandler } from "express";
import passport from "passport";
import { HttpStatusCode } from "../../utils/HttpStatusCode.js";
import logger from "../../logger.js";
import { getUserProfile, registerUser } from "./auth.service.js";

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

  const user = await registerUser({
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

export const getMe: RequestHandler = async (req, res) => {
  const profile = await getUserProfile(req.user!.id);
  res.status(HttpStatusCode.OK).json(profile);
};
