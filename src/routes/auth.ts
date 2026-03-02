import crypto from "node:crypto";
import { promisify } from "node:util";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";
import { ensureAuthenticated } from "../middlewares.js";
import { findUserByUsername, findUserById, createUser } from "../db/queries.js";
import AppError from "../utils/AppError.js";

const pbkdf2Async = promisify(crypto.pbkdf2);

const router = express.Router();

const ITERATIONS = 310000;

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await findUserByUsername(username);
      if (!user) {
        return cb(
          new AppError(
            "Username or password is incorrect.",
            HttpStatusCode.UNAUTHORIZED,
            false,
          ),
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
      if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
        return cb(
          new AppError(
            "Username or password is incorrect.",
            HttpStatusCode.UNAUTHORIZED,
          ),
          false,
        );
      }
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
      const user = await findUserByUsername(username);
      cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate(
    "local",
    (err: any, user: Express.User, info: any, status: number) => {
      if (err) {
        return next(err);
      }
      req.login(user, (err) => {
        if (err) {
          next(err);
        }
        res.status(HttpStatusCode.OK).json({ msg: "Login successful!" });
      });
    },
  )(req, res, next);
});

router.post("/signup", async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;
  const salt = crypto.randomBytes(16);
  const hashedPassword = await pbkdf2Async(
    password,
    salt,
    ITERATIONS,
    32,
    "sha256",
  );

  const user = await createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    username,
    salt,
  });

  req.login(user as Express.User, (err) => {
    if (err) {
      return next(err);
    }
    res.status(HttpStatusCode.OK).json({ user, msg: "User created!" });
  });
});

router.get("/me", ensureAuthenticated, async (req, res) => {
  const user = await findUserById(req.user!.id);

  res.status(HttpStatusCode.OK).json({
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  });
});

export default router;
