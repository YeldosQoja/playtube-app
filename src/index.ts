import express from "express";
import logger from "#lib/logger.js";
import cors from "cors";
import { createAccountController } from "#app/account/account.controller.js";
import { createAccountRouter } from "#app/account/account.route.js";
import { createCommentController } from "#app/comment/comment.controller.js";
import { createCommentRouter } from "#app/comment/comment.route.js";
import { createPlaylistController } from "#app/playlist/playlist.controller.js";
import { createPlaylistRouter } from "#app/playlist/playlist.route.js";
import { createUploadController } from "#app/upload/upload.controller.js";
import { createUploadRouter } from "#app/upload/upload.route.js";
import { createVideoController } from "#app/video/video.controller.js";
import { createVideoRouter } from "#app/video/video.route.js";
import { isAuthenticated } from "#middlewares/is-authenticated.js";
import { handleError } from "#middlewares/handle-error.js";
import { pinoHttp } from "pino-http";
import { AccountRepository } from "#lib/data/account.repository.js";
import { CommentRepository } from "#lib/data/comment.repository.js";
import { PlaylistRepository } from "#lib/data/playlist.repository.js";
import { VideoRepository } from "#lib/data/video.repository.js";
import { CloudFrontAdapter } from "#lib/storage/cloudfront.adapter.js";
import { S3Adapter } from "#lib/storage/s3.adapter.js";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { AccountService } from "#components/account/account.service.js";
import { CommentService } from "#components/comment/comment.service.js";
import { PlaylistService } from "#components/playlist/playlist.service.js";
import { UploadService } from "#components/upload/upload.service.js";
import { VideoFactory } from "#components/video/domain/video.factory.js";
import { VideoService } from "#components/video/video.service.js";

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
const videoRepository = new VideoRepository();
const playlistRepository = new PlaylistRepository();
const videoAssetService = new CloudFrontAdapter(new SecretsManagerClient());
const forcePathStyle = process.env["AWS_S3_FORCE_PATH_STYLE"] || false;
const uploadStorage = new S3Adapter({
  forcePathStyle: forcePathStyle === "true",
});
const uploadService = new UploadService(accountRepository, uploadStorage);
const videoService = new VideoService(
  new VideoFactory(),
  videoRepository,
  playlistRepository,
  videoAssetService,
  accountRepository,
  uploadService,
);
const videoController = createVideoController(videoService);
const videoRouter = createVideoRouter(videoController);
const commentRepository = new CommentRepository();
const commentService = new CommentService(
  commentRepository,
  videoRepository,
  accountRepository,
);
const commentController = createCommentController(commentService);
const commentRouter = createCommentRouter(commentController);
const playlistService = new PlaylistService(
  playlistRepository,
  videoRepository,
  accountRepository,
);
const playlistController = createPlaylistController(playlistService);
const playlistRouter = createPlaylistRouter(playlistController);
const uploadController = createUploadController(uploadService);
const uploadRouter = createUploadRouter(uploadController);

app.use("/", isAuthenticated);
app.use("/account", accountRouter);
app.use("/video", videoRouter);
app.use("/comment", commentRouter);
app.use("/upload", uploadRouter);
app.use("/playlist", playlistRouter);
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
