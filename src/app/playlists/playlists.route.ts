import express from "express";
import { validate } from "#middlewares/validate.js";
import { createPlaylistSchema } from "#validators/playlists/create-playlist.schema.js";
import { listPlaylistsSchema } from "#validators/playlists/list-playlists.schema.js";
import { getPlaylistSchema } from "#validators/playlists/get-playlist.schema.js";
import { updatePlaylistSchema } from "#validators/playlists/update-playlist.schema.js";
import { deletePlaylistSchema } from "#validators/playlists/delete-playlist.schema.js";
import { addVideoToPlaylistSchema } from "#validators/playlists/add-video.schema.js";
import { removeVideoFromPlaylistSchema } from "#validators/playlists/remove-video.schema.js";
import {
  addVideoToPlaylistHandler,
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistHandler,
  listPlaylistsHandler,
  removeVideoFromPlaylistHandler,
  updatePlaylistHandler,
} from "./playlists.controller.js";

const router = express.Router();

router.post("/", validate(createPlaylistSchema), createPlaylistHandler);
router.get("/", validate(listPlaylistsSchema), listPlaylistsHandler);
router.get("/:id", validate(getPlaylistSchema), getPlaylistHandler);
router.put("/:id", validate(updatePlaylistSchema), updatePlaylistHandler);
router.delete("/:id", validate(deletePlaylistSchema), deletePlaylistHandler);
router.post(
  "/:playlistId/videos/:videoId",
  validate(addVideoToPlaylistSchema),
  addVideoToPlaylistHandler,
);
router.delete(
  "/:playlistId/videos/:videoId",
  validate(removeVideoFromPlaylistSchema),
  removeVideoFromPlaylistHandler,
);

export default router;
