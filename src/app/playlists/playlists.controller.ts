import type { RequestHandler } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import {
  addVideo,
  createPlaylistForUser,
  deletePlaylistById,
  getPlaylistById,
  getVideoById,
  listPlaylistsForUser,
  removeVideo,
  updatePlaylistById,
} from "./playlists.service.js";

export const createPlaylistHandler: RequestHandler = async (req, res) => {
  const { title, desc, thumbnailStorageKey, thumbnailKey } = req.body;

  const playlist = await createPlaylistForUser(req.user!.id, {
    title,
    desc,
    thumbnailStorageKey,
    thumbnailKey,
  });

  res.status(HttpStatusCode.CREATED).send({
    msg: "Playlist has been created!",
    playlist,
  });
};

export const listPlaylistsHandler: RequestHandler = async (req, res) => {
  const playlists = await listPlaylistsForUser(req.user!.id);

  res.status(HttpStatusCode.OK).send({ playlists });
};

export const getPlaylistHandler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  const playlist = await getPlaylistById(id);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to access this playlist.",
    });
    return;
  }

  res.status(HttpStatusCode.OK).send({ playlist });
};

export const updatePlaylistHandler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  const playlist = await getPlaylistById(id);

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

  const updatedPlaylist = await updatePlaylistById(id, updates);

  res.status(HttpStatusCode.OK).send({
    msg: "Playlist has been updated.",
    playlist: updatedPlaylist,
  });
};

export const deletePlaylistHandler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  const playlist = await getPlaylistById(id);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to delete this playlist.",
    });
    return;
  }

  await deletePlaylistById(id);

  res.status(HttpStatusCode.OK).send({ msg: "Playlist has been deleted." });
};

export const addVideoToPlaylistHandler: RequestHandler = async (req, res) => {
  const playlistId = Number(req.params.playlistId);
  const videoId = Number(req.params.videoId);

  const playlist = await getPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to update this playlist.",
    });
    return;
  }

  const video = await getVideoById(videoId);

  if (video.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You can only add your own videos to this playlist.",
    });
    return;
  }

  await addVideo(playlistId, videoId);

  res.status(HttpStatusCode.OK).send({
    msg: "Video has been added to the playlist.",
  });
};

export const removeVideoFromPlaylistHandler: RequestHandler = async (
  req,
  res,
) => {
  const playlistId = Number(req.params.playlistId);
  const videoId = Number(req.params.videoId);

  const playlist = await getPlaylistById(playlistId);

  if (playlist.author !== req.user!.id) {
    res.status(HttpStatusCode.FORBIDDEN).send({
      err: "You are not authorized to update this playlist.",
    });
    return;
  }

  await removeVideo(playlistId, videoId);

  res.status(HttpStatusCode.OK).send({
    msg: "Video has been removed from the playlist.",
  });
};
