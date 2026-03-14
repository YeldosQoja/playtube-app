import express from "express";
import { validate } from "#middlewares/validate.js";
import { createDraftSchema } from "#validators/videos/create-draft.schema.js";
import { listVideosSchema } from "#validators/videos/list-videos.schema.js";
import { listVideoCategoriesSchema } from "#validators/videos/list-categories.schema.js";
import { saveVideoSchema } from "#validators/videos/save-video.schema.js";
import { getVideoCommentsSchema } from "#validators/videos/get-video-comments.schema.js";
import { deleteVideoSchema } from "#validators/videos/delete-video.schema.js";
import { getVideoSchema } from "#validators/videos/get-video.schema.js";
import {
  createDraftHandler,
  deleteVideoHandler,
  getVideoCommentsHandler,
  getVideoHandler,
  listVideoCategoriesHandler,
  listVideosHandler,
  saveVideoHandler,
} from "./videos.controller.js";

const router = express.Router();

router.post("", validate(createDraftSchema), createDraftHandler);
router.get("", validate(listVideosSchema), listVideosHandler);
router.get(
  "/categories",
  validate(listVideoCategoriesSchema),
  listVideoCategoriesHandler,
);
router.put("/:videoKey", validate(saveVideoSchema), saveVideoHandler);
router.get(
  "/:videoKey/comments",
  validate(getVideoCommentsSchema),
  getVideoCommentsHandler,
);
router.delete("/:videoKey", validate(deleteVideoSchema), deleteVideoHandler);
router.get("/:videoKey", validate(getVideoSchema), getVideoHandler);

export default router;
