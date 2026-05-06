import type { RequestHandler } from "express";
import { requireAccount } from "#core/account/account.policy.js";
import type { IPlaylistService } from "#core/playlist/playlist.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function createPlaylistController(playlistService: IPlaylistService) {
  return {
    create: (async (req, res) => {
      const account = requireAccount(req.account);
      const { title, desc, thumbnailStorageKey, thumbnailKey } = req.body;
      const playlist = await playlistService.create(account, {
        title,
        desc,
        thumbnailStorageKey,
        thumbnailKey,
      });

      res.status(HttpStatusCode.CREATED).send({
        msg: "Playlist has been created!",
        playlist,
      });
    }) satisfies RequestHandler,

    list: (async (req, res) => {
      const account = requireAccount(req.account);
      const playlists = await playlistService.list(account);

      res.status(HttpStatusCode.OK).send({ playlists });
    }) satisfies RequestHandler,

    get: (async (req, res) => {
      const account = requireAccount(req.account);
      const id = Number(req.params["id"]);
      const playlist = await playlistService.get(account, id);

      res.status(HttpStatusCode.OK).send({ playlist });
    }) satisfies RequestHandler,

    update: (async (req, res) => {
      const account = requireAccount(req.account);
      const id = Number(req.params["id"]);
      const updatedPlaylist = await playlistService.update(account, id, req.body);

      res.status(HttpStatusCode.OK).send({
        msg: "Playlist has been updated.",
        playlist: updatedPlaylist,
      });
    }) satisfies RequestHandler,

    delete: (async (req, res) => {
      const account = requireAccount(req.account);
      const id = Number(req.params["id"]);

      await playlistService.delete(account, id);

      res.status(HttpStatusCode.OK).send({ msg: "Playlist has been deleted." });
    }) satisfies RequestHandler,

    addVideo: (async (req, res) => {
      const account = requireAccount(req.account);
      const playlistId = Number(req.params["playlistId"]);
      const videoId = Number(req.params["videoId"]);

      await playlistService.addVideo(account, playlistId, videoId);

      res.status(HttpStatusCode.OK).send({
        msg: "Video has been added to the playlist.",
      });
    }) satisfies RequestHandler,

    removeVideo: (async (req, res) => {
      const account = requireAccount(req.account);
      const playlistId = Number(req.params["playlistId"]);
      const videoId = Number(req.params["videoId"]);

      await playlistService.removeVideo(account, playlistId, videoId);

      res.status(HttpStatusCode.OK).send({
        msg: "Video has been removed from the playlist.",
      });
    }) satisfies RequestHandler,
  };
}

export type PlaylistController = ReturnType<typeof createPlaylistController>;
