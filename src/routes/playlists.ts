import express from "express";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  findPlaylistById,
  findVideoById,
  getPlaylistsByAuthor,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../db/queries.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, desc, thumbnailStorageKey, thumbnailKey } = req.body;
  const thumbnail = thumbnailStorageKey || thumbnailKey;

  if (!title || !thumbnail) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Title and thumbnail key are required.",
    });
    return;
  }

  const playlist = await createPlaylist({
    author: req.user!.id,
    title,
    desc,
    thumbnailStorageKey: thumbnail,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });

  res.status(HttpStatusCode.CREATED).send({
    msg: "Playlist has been created!",
    playlist,
  });
});

router.get("/", async (req, res) => {
  const playlists = await getPlaylistsByAuthor(req.user!.id);

  res.status(HttpStatusCode.OK).send({ playlists });
});

router.get("/:id", async (req, res) => {
  const playlistId = parseInt(req.params.id);

  if (Number.isNaN(playlistId)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Playlist id is invalid.",
    });
    return;
  }

  const playlist = await findPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to access this playlist.",
    });
    return;
  }

  res.status(HttpStatusCode.OK).send({ playlist });
});

router.put("/:id", async (req, res) => {
  const playlistId = parseInt(req.params.id);

  if (Number.isNaN(playlistId)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Playlist id is invalid.",
    });
    return;
  }

  const playlist = await findPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to update this playlist.",
    });
    return;
  }

  const { title, desc, thumbnailStorageKey, thumbnailKey } = req.body;
  const thumbnail = thumbnailStorageKey || thumbnailKey;
  const updates: Partial<{
    title: string;
    desc: string | null;
    thumbnailStorageKey: string;
    lastUpdatedAt: string;
  }> = {
    lastUpdatedAt: new Date().toISOString(),
  };

  if (title) {
    updates.title = title;
  }
  if (desc !== undefined) {
    updates.desc = desc;
  }
  if (thumbnail) {
    updates.thumbnailStorageKey = thumbnail;
  }

  const updatedPlaylist = await updatePlaylist(playlistId, updates);

  res.status(HttpStatusCode.OK).send({
    msg: "Playlist has been updated.",
    playlist: updatedPlaylist,
  });
});

router.delete("/:id", async (req, res) => {
  const playlistId = parseInt(req.params.id);

  if (Number.isNaN(playlistId)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Playlist id is invalid.",
    });
    return;
  }

  const playlist = await findPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to delete this playlist.",
    });
    return;
  }

  await deletePlaylist(playlistId);

  res.status(HttpStatusCode.OK).send({ msg: "Playlist has been deleted." });
});

router.post("/:playlistId/videos/:videoId", async (req, res) => {
  const playlistId = parseInt(req.params.playlistId);
  const videoId = parseInt(req.params.videoId);

  if (Number.isNaN(playlistId) || Number.isNaN(videoId)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Playlist id or video id is invalid.",
    });
    return;
  }

  const playlist = await findPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to update this playlist.",
    });
    return;
  }

  const video = await findVideoById(videoId);

  if (video.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You can only add your own videos to this playlist.",
    });
    return;
  }

  await addVideoToPlaylist(videoId, playlistId);
  await updatePlaylist(playlistId, {
    lastUpdatedAt: new Date().toISOString(),
  });

  res.status(HttpStatusCode.OK).send({
    msg: "Video has been added to the playlist.",
  });
});

router.delete("/:playlistId/videos/:videoId", async (req, res) => {
  const playlistId = parseInt(req.params.playlistId);
  const videoId = parseInt(req.params.videoId);

  if (Number.isNaN(playlistId) || Number.isNaN(videoId)) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Playlist id or video id is invalid.",
    });
    return;
  }

  const playlist = await findPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to update this playlist.",
    });
    return;
  }

  await removeVideoFromPlaylist(videoId, playlistId);
  await updatePlaylist(playlistId, {
    lastUpdatedAt: new Date().toISOString(),
  });

  res.status(HttpStatusCode.OK).send({
    msg: "Video has been removed from the playlist.",
  });
});

export default router;
