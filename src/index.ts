import express from "express";
import logger from "#lib/logger.js";
import cors from "cors";
import { createAccountRouter } from "#app/account/account.route.js";
import { createCommentController } from "#app/comment/comment.controller.js";
import { createCommentRouter } from "#app/comment/comment.route.js";
import { CommentService } from "#app/comment/comment.service.js";
import { createPlaylistController } from "#app/playlist/playlist.controller.js";
import { createPlaylistRouter } from "#app/playlist/playlist.route.js";
import { PlaylistService } from "#app/playlist/playlist.service.js";
import { createUploadController } from "#app/upload/upload.controller.js";
import { createUploadRouter } from "#app/upload/upload.route.js";
import { UploadService } from "#app/upload/upload.service.js";
import { createVideoController } from "#app/video/video.controller.js";
import { createVideoRouter } from "#app/video/video.route.js";
import { VideoService } from "#app/video/video.service.js";
import {
  createAccountContextMiddleware,
  isAuthenticated,
} from "#middlewares/is-authenticated.js";
import { handleError } from "#middlewares/handle-error.js";
import { pinoHttp } from "pino-http";
import { AccountRepository } from "#lib/data/account.repository.js";
import { CommentRepository } from "#lib/data/comment.repository.js";
import { PlaylistRepository } from "#lib/data/playlist.repository.js";
import { VideoRepository } from "#lib/data/video.repository.js";
import { AccountService } from "#app/account/account.service.js";
import { createAccountController } from "#app/account/account.controller.js";
import { CloudFrontVideoAssetService } from "#lib/storage/cloudfront-video.asset-service.js";
import { S3UploadStorage } from "#lib/storage/s3-upload.storage.js";
import { CloudFrontService } from "#services/aws/CloudFrontService.js";

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
const videoAssetService = new CloudFrontVideoAssetService(
  new CloudFrontService(),
);
const videoService = new VideoService(videoRepository, videoAssetService);
const videoController = createVideoController(videoService);
const videoRouter = createVideoRouter(videoController);
const commentRepository = new CommentRepository();
const commentService = new CommentService(commentRepository, videoRepository);
const commentController = createCommentController(commentService);
const commentRouter = createCommentRouter(commentController);
const playlistRepository = new PlaylistRepository();
const playlistService = new PlaylistService(playlistRepository, videoRepository);
const playlistController = createPlaylistController(playlistService);
const playlistRouter = createPlaylistRouter(playlistController);
const forcePathStyle = process.env["AWS_S3_FORCE_PATH_STYLE"] || false;
const uploadStorage = new S3UploadStorage({
  forcePathStyle: forcePathStyle === "true",
});
const uploadService = new UploadService(uploadStorage);
const uploadController = createUploadController(uploadService);
const uploadRouter = createUploadRouter(uploadController);

app.use("/", isAuthenticated);
app.use("/account", accountRouter);
app.use(createAccountContextMiddleware(accountService));
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
