import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import logger from "#lib/logger.js";
import { pool } from "#db/index.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import { createAuthRouter } from "#app/auth/auth.route.js";
import { createAccountRouter } from "#app/account/account.route.js";
import videosRouter from "#app/videos/videos.route.js";
import commentsRouter from "#app/comments/comments.route.js";
import uploadRouter from "#app/upload/upload.route.js";
import playlistsRouter from "#app/playlists/playlists.route.js";
import { isAuthenticated } from "#middlewares/is-authenticated.js";
import { handleError } from "#middlewares/handle-error.js";
import { pinoHttp } from "pino-http";
import { createAuthController } from "#app/auth/auth.controller.js";
import { authUserRepository } from "#lib/data/auth.repository.js";
import { AuthService } from "#app/auth/auth.service.js";
import { SessionStrategy } from "#lib/auth/session-strategy.js";
import { AccountRepository } from "#lib/data/account.repository.js";
import { AccountService } from "#app/account/account.service.js";
import { createAccountController } from "#app/account/account.controller.js";

export const app = express();

const port = process.env["PORT"];
const sessionSecret = process.env["SESSION_SECRET"] as string;
const userSessionsTable = process.env["SESSION_TABLE"] || "user_sessions";
const env = process.env["NODE_ENV"] || "development";
const origins = process.env["ALLOWED_ORIGINS"] || "*";

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.method === "OPTIONS",
    },
  }),
);
app.use(
  session({
    secret: sessionSecret,
    store: new (connectPgSimple(session))({
      pool,
      tableName: userSessionsTable,
      createTableIfMissing: true,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env === "production",
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
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
app.use(express.json());
app.use(
  cors({
    origin: origins.split(","),
    credentials: true,
  }),
);

// a temporary solution to make query object mutable
// will change by adding validatedQuery field to Request object and extending it using ts declarations
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true,
  });
  next();
});

// Auth component construction
const accountRepository = new AccountRepository();
const authService = new AuthService(accountRepository).addStrategy(
  "session",
  new SessionStrategy(authUserRepository),
);
const authController = createAuthController(authService);
const authRouter = createAuthRouter(authController);

// Account component construction
const accountService = new AccountService(accountRepository);
const accountController = createAccountController(accountService);
const accountRouter = createAccountRouter(accountController);

app.use("/auth", authRouter);
app.use("/account", isAuthenticated, accountRouter);
app.use("/videos", isAuthenticated, videosRouter);
app.use("/comments", isAuthenticated, commentsRouter);
app.use("/upload", isAuthenticated, uploadRouter);
app.use("/playlists", isAuthenticated, playlistsRouter);
app.use(handleError);

process.on("uncaughtException", (error) => {
  logger.fatal(error, "Uncaught exception found");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled rejection found");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
