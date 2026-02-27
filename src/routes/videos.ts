import express from "express";
import { CloudFrontService } from "../services/aws/CloudFrontService.js";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";
import {
  findVideoByKey,
  updateVideo,
  deleteVideo,
  getCommentsByVideoId,
  getUploadedVideos,
  createVideoDraft,
} from "../db/queries.js";
import { nanoid } from "nanoid";

const router = express.Router();

const cloudFrontService = new CloudFrontService();

router.post("", async (req, res) => {
  const { title } = req.body;

  const videoKey = nanoid();

  await createVideoDraft({
    author: req.user!.id,
    key: videoKey,
    title,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });

  res.status(HttpStatusCode.OK).send({ key: videoKey });
});

router.get("", async (req, res) => {
  const videos = await getUploadedVideos();
  res.status(HttpStatusCode.OK).send({ videos });
});

router.put("/:videoKey", async (req, res) => {
  const { videoKey } = req.params;
  const { playlist, tags, ...rest } = req.body;
  await updateVideo(videoKey, rest, playlist, tags);
  res.status(HttpStatusCode.OK).send({ msg: "The video has been created!" });
});

router.get("/:videoKey/comments", async (req, res) => {
  const { videoKey } = req.params;
  const offset = req.query["offset"] as string;
  const limit = req.query["limit"] as string;

  if (!limit) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "You must set limit query param. It is required.",
    });
    return;
  }

  const video = await findVideoByKey(videoKey);
  const comments = await getCommentsByVideoId(
    video.id,
    parseInt(limit),
    parseInt(offset || "0"),
  );

  res.status(HttpStatusCode.OK).send({
    msg: "Comments retrieved!",
    comments,
  });
});

router.delete("/:videoKey", async (req, res) => {
  const { videoKey } = req.params;

  const video = await findVideoByKey(videoKey);

  if (video.author !== req.user!.id) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send({ err: "You are not authorized to delete this video." });
    return;
  }

  await deleteVideo(videoKey);

  res.status(HttpStatusCode.OK).send({ msg: "video deleted successfully." });
});

router.get("/:videoKey", async (req, res) => {
  const { videoKey } = req.params;

  const user = req.user as Express.User;

  const video = await findVideoByKey(videoKey);
  const { key, thumbnailKey, tags, ...rest } = video;

  const videoUrlPromise = cloudFrontService.generateSignedUrl(
    user.username,
    key,
    Date.now() + 3600,
  );
  const thumbnailUrlPromise = cloudFrontService.generateSignedUrl(
    user.username,
    thumbnailKey!,
    Date.now() + 3600,
  );

  const [videoUrl, thumbnailUrl] = await Promise.all([
    videoUrlPromise,
    thumbnailUrlPromise,
  ]);

  // flattening tag objects
  const data: Omit<typeof video, "tags" | "key" | "thumbnailKey"> & {
    tags: { id: number; name: string }[];
    videoUrl: string;
    thumbnailUrl: string;
  } = {
    ...rest,
    videoUrl,
    thumbnailUrl,
    tags: tags.map(({ tag }) => tag),
  };

  res.status(HttpStatusCode.OK).send({ data });
});

export default router;
