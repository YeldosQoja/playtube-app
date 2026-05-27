import express from "express";
import type { RequestValidator } from "#middlewares/validate.js";
import { createDraftSchema } from "#validators/videos/create-draft.schema.js";
import { deleteVideoSchema } from "#validators/videos/delete-video.schema.js";
import { getVideoSchema } from "#validators/videos/get-video.schema.js";
import { listVideosSchema } from "#validators/videos/list-videos.schema.js";
import { saveVideoSchema } from "#validators/videos/save-video.schema.js";
import type { VideoController } from "./video.controller.js";

export function createVideoRouter(
  videoController: VideoController,
  requestValidator: RequestValidator,
) {
  const router = express.Router();

  router.post(
    "/draft",
    requestValidator.validate(createDraftSchema),
    videoController.createDraft,
  );
  router.get(
    "/list",
    requestValidator.validate(listVideosSchema),
    videoController.list,
  );
  router.put(
    "/save/:videoKey",
    requestValidator.validate(saveVideoSchema),
    videoController.save,
  );
  router.delete(
    "/delete/:videoKey",
    requestValidator.validate(deleteVideoSchema),
    videoController.delete,
  );
  router.get(
    "/detail/:videoKey",
    requestValidator.validate(getVideoSchema),
    videoController.get,
  );

  return router;
}
