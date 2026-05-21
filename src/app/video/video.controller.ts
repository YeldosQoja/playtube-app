import type { RequestHandler } from "express";
import { VideoService } from "#components/video/video.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { CreateDraftBody } from "#validators/videos/create-draft.schema.js";
import { SaveVideoMetadataBody } from "#validators/videos/save-video.schema.js";

export function createVideoController(videoService: VideoService) {
  return {
    createDraft: (async (req, res) => {
      const { title, contentType, fileSize } = req.body as CreateDraftBody;
      const { key, upload } = await videoService.createDraft({
        userId: req.user.id,
        title,
        contentType,
        fileSize,
      });

      res.status(HttpStatusCode.OK).send({
        key,
        uploadUrls: upload.urls,
        uploadSession: upload.sessionId,
      });
    }) satisfies RequestHandler,

    list: (async (req, res) => {
      const videos = await videoService.listUploaded();

      res.status(HttpStatusCode.OK).send({ videos });
    }) satisfies RequestHandler,

    save: (async (req, res) => {
      const videoKey = req.params["videoKey"] as string;
      const { title, desc, thumbnailKey, playlist, category, tags, ...rest } =
        req.body as SaveVideoMetadataBody;

      await videoService.save({
        key: videoKey,
        title,
        desc,
        thumbnailKey,
        categoryId: category,
        playlistId: playlist,
        tags: tags.split(",").map((t) => t.trim()),
        ...rest,
      });

      res
        .status(HttpStatusCode.OK)
        .send({ msg: "The video has been created!" });
    }) satisfies RequestHandler,

    delete: (async (req, res) => {
      const videoKey = req.params["videoKey"] as string;
      await videoService.delete(videoKey);
      res
        .status(HttpStatusCode.OK)
        .send({ msg: "video deleted successfully." });
    }) satisfies RequestHandler,

    get: (async (req, res) => {
      const videoKey = req.params["videoKey"] as string;
      const result = await videoService.getVideoDetails(videoKey);
      const { ...data } = result;
      res.status(HttpStatusCode.OK).send({ data });
    }) satisfies RequestHandler,
  };
}

export type VideoController = ReturnType<typeof createVideoController>;
