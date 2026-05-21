import type { RequestHandler } from "express";
import { PlaylistService } from "#components/playlist/playlist.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { CreatePlaylistBody } from "#validators/playlists/create-playlist.schema.js";
import { UpdatePlaylistBody } from "#validators/playlists/update-playlist.schema.js";
import { AddVideoParams } from "#validators/playlists/add-video.schema.js";
import { RemoveVideoParams } from "#validators/playlists/remove-video.schema.js";

export function createPlaylistController(playlistService: PlaylistService) {
  return {
    create: (async (req, res) => {
      const { title, desc, thumbnailKey } = req.body as CreatePlaylistBody;
      const playlist = await playlistService.create({
        authUserId: req.user.id,
        title,
        desc,
        thumbnailKey,
      });

      res.status(HttpStatusCode.CREATED).send({
        msg: "Playlist has been created!",
        playlist,
      });
    }) satisfies RequestHandler,

    list: (async (req, res) => {
      const playlists = await playlistService.list(req.user.id);

      res.status(HttpStatusCode.OK).send({ playlists });
    }) satisfies RequestHandler,

    get: (async (req, res) => {
      const id = Number(req.params["id"]);
      const playlist = await playlistService.get(id);

      res.status(HttpStatusCode.OK).send({ playlist });
    }) satisfies RequestHandler,

    update: (async (req, res) => {
      const id = Number(req.params["id"]);
      const { desc, thumbnailKey, title } = req.body as UpdatePlaylistBody;
      const updatedPlaylist = await playlistService.update({
        userId: req.user.id,
        playlistId: id,
        title,
        desc,
        thumbnailKey,
      });

      res.status(HttpStatusCode.OK).send({
        msg: "Playlist has been updated.",
        playlist: updatedPlaylist,
      });
    }) satisfies RequestHandler,

    delete: (async (req, res) => {
      const id = Number(req.params["id"]);

      await playlistService.delete(id);

      res.status(HttpStatusCode.OK).send({ msg: "Playlist has been deleted." });
    }) satisfies RequestHandler,

    addVideo: (async (req, res) => {
      const { playlistId, videoId } = req.params as unknown as AddVideoParams;

      await playlistService.addVideo({ playlistId, videoId });

      res.status(HttpStatusCode.OK).send({
        msg: "Video has been added to the playlist.",
      });
    }) satisfies RequestHandler,

    removeVideo: (async (req, res) => {
      const { playlistId, videoId } =
        req.params as unknown as RemoveVideoParams;

      await playlistService.removeVideo({ playlistId, videoId });

      res.status(HttpStatusCode.OK).send({
        msg: "Video has been removed from the playlist.",
      });
    }) satisfies RequestHandler,
  };
}

export type PlaylistController = ReturnType<typeof createPlaylistController>;
