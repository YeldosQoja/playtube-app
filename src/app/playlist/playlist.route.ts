import express from "express";
import type { RequestValidator } from "#middlewares/validate.js";
import { addVideoToPlaylistSchema } from "#validators/playlists/add-video.schema.js";
import { createPlaylistSchema } from "#validators/playlists/create-playlist.schema.js";
import { deletePlaylistSchema } from "#validators/playlists/delete-playlist.schema.js";
import { getPlaylistSchema } from "#validators/playlists/get-playlist.schema.js";
import { listPlaylistsSchema } from "#validators/playlists/list-playlists.schema.js";
import { removeVideoFromPlaylistSchema } from "#validators/playlists/remove-video.schema.js";
import { updatePlaylistSchema } from "#validators/playlists/update-playlist.schema.js";
import type { PlaylistController } from "./playlist.controller.js";

export function createPlaylistRouter(
  playlistController: PlaylistController,
  requestValidator: RequestValidator,
) {
  const router = express.Router();

  router.post(
    "/create",
    requestValidator.validate(createPlaylistSchema),
    playlistController.create,
  );
  router.get(
    "/list",
    requestValidator.validate(listPlaylistsSchema),
    playlistController.list,
  );
  router.get(
    "/detail/:id",
    requestValidator.validate(getPlaylistSchema),
    playlistController.get,
  );
  router.put(
    "/update/:id",
    requestValidator.validate(updatePlaylistSchema),
    playlistController.update,
  );
  router.delete(
    "/delete/:id",
    requestValidator.validate(deletePlaylistSchema),
    playlistController.delete,
  );
  router.post(
    "/video/add/:playlistId/:videoId",
    requestValidator.validate(addVideoToPlaylistSchema),
    playlistController.addVideo,
  );
  router.delete(
    "/video/remove/:playlistId/:videoId",
    requestValidator.validate(removeVideoFromPlaylistSchema),
    playlistController.removeVideo,
  );

  return router;
}
