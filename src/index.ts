import express from "express";
import logger from "#lib/logger.js";
import cors from "cors";
import { createAccountRouter } from "#app/account/account.route.js";
import videosRouter from "#app/videos/videos.route.js";
import commentsRouter from "#app/comments/comments.route.js";
import uploadRouter from "#app/upload/upload.route.js";
import playlistsRouter from "#app/playlists/playlists.route.js";
import { isAuthenticated } from "#middlewares/is-authenticated.js";
import { handleError } from "#middlewares/handle-error.js";
import { pinoHttp } from "pino-http";
import { AccountRepository } from "#lib/data/account.repository.js";
import { AccountService } from "#app/account/account.service.js";
import { createAccountController } from "#app/account/account.controller.js";

export const app = express();

const port = process.env["PORT"];
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

// Account component construction
const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);
const accountController = createAccountController(accountService);
const accountRouter = createAccountRouter(accountController);

app.use("/", isAuthenticated);
app.use("/account", accountRouter);
app.use("/videos", videosRouter);
app.use("/comments", commentsRouter);
app.use("/upload", uploadRouter);
app.use("/playlists", playlistsRouter);
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
