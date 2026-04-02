import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "#db/index.js";
import passport from "passport";
import cors from "cors";
import authRouter from "#app/auth/auth.route.js";
import accountRouter from "#app/account/account.route.js";
import videosRouter from "#app/videos/videos.route.js";
import commentsRouter from "#app/comments/comments.route.js";
import uploadRouter from "#app/upload/upload.route.js";
import playlistsRouter from "#app/playlists/playlists.route.js";
import { isAuthenticated } from "#middlewares/is-authenticated.js";
import { handleError } from "#middlewares/handle-error.js";
import logger from "#lib/logger.js";
import { pinoHttp } from "pino-http";

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
