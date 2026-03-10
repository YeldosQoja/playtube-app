import crypto from "node:crypto";
import { promisify } from "node:util";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { HttpStatusCode } from "../../utils/HttpStatusCode.js";
import AppError from "../../utils/AppError.js";
import logger from "../../logger.js";
import { findUserByUsername, findUserById, createUser } from "../../db/queries.js";

const pbkdf2Async = promisify(crypto.pbkdf2);
const ITERATIONS = 310000;
let passportConfigured = false;

export function configurePassport() {
  if (passportConfigured) {
    return;
  }

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
        logger.info(
          "Invalid cookies provided. Unable to authenticate the request.",
        );
        cb(err, null);
      }
    });
  });

  passportConfigured = true;
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  password: string;
}) {
  const salt = crypto.randomBytes(16);
  const hashedPassword = await pbkdf2Async(
    data.password,
    salt,
    ITERATIONS,
    32,
    "sha256",
  );

  return await createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    username: data.username,
    salt,
  });
}

export async function getUserProfile(userId: number) {
  const user = await findUserById(userId);

  return {
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}
