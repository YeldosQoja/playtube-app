import express from "express";
import { validate } from "#middlewares/validate.js";
import { createDraftSchema } from "#validators/videos/create-draft.schema.js";
import { deleteVideoSchema } from "#validators/videos/delete-video.schema.js";
import { getVideoCommentsSchema } from "#validators/videos/get-video-comments.schema.js";
import { getVideoSchema } from "#validators/videos/get-video.schema.js";
import { listVideoCategoriesSchema } from "#validators/videos/list-categories.schema.js";
import { listVideosSchema } from "#validators/videos/list-videos.schema.js";
import { saveVideoSchema } from "#validators/videos/save-video.schema.js";
import type { VideoController } from "./video.controller.js";

export function createVideoRouter(videoController: VideoController) {
  const router = express.Router();

  router.post("/draft", validate(createDraftSchema), videoController.createDraft);
  router.get("/list", validate(listVideosSchema), videoController.list);
  router.get(
    "/category/list",
    validate(listVideoCategoriesSchema),
    videoController.listCategories,
  );
  router.put("/save/:videoKey", validate(saveVideoSchema), videoController.save);
  router.get(
    "/comment/list/:videoKey",
    validate(getVideoCommentsSchema),
    videoController.listComments,
  );
  router.delete(
    "/delete/:videoKey",
    validate(deleteVideoSchema),
    videoController.delete,
  );
  router.get("/detail/:videoKey", validate(getVideoSchema), videoController.get);

  return router;
}
