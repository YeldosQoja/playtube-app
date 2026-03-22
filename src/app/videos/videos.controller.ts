import type { RequestHandler } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import {
  createDraft,
  deleteVideoByKey,
  getVideoByKey,
  getVideoComments,
  getVideoDetails,
  listUploadedVideos,
  listVideoCategories,
  saveVideo,
} from "./videos.service.js";
import { getAwsConfig } from "#config/aws.js";
import logger from "#lib/logger.js";

export const createDraftHandler: RequestHandler = async (req, res) => {
  const { title } = req.body;
  const { key } = await createDraft(req.user!.id, title);

  res.status(HttpStatusCode.OK).send({ key });
};

export const listVideosHandler: RequestHandler = async (req, res) => {
  const videos = await listUploadedVideos(req.user!.username);
  res.status(HttpStatusCode.OK).send({ videos });
};

export const listVideoCategoriesHandler: RequestHandler = async (req, res) => {
  const categories = await listVideoCategories();
  res.status(HttpStatusCode.OK).send({ categories });
};

export const saveVideoHandler: RequestHandler = async (req, res) => {
  const videoKey = req.params["videoKey"];
  const { playlist, tags, ...rest } = req.body;

  await saveVideo(videoKey as string, rest, playlist, tags);

  res.status(HttpStatusCode.OK).send({ msg: "The video has been created!" });
};

export const getVideoCommentsHandler: RequestHandler = async (req, res) => {
  const videoKey = req.params["videoKey"];
  const limit = Number(req.query["limit"]);
  const offset = Number(req.query["offset"] ?? 0);

  const comments = await getVideoComments(videoKey as string, limit, offset);

  res.status(HttpStatusCode.OK).send({
    msg: "Comments retrieved.",
    comments,
  });
};

export const deleteVideoHandler: RequestHandler = async (req, res) => {
  const videoKey = req.params["videoKey"];

  const video = await getVideoByKey(videoKey as string);

  if (video.author !== req.user!.id) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send({ err: "You are not authorized to delete this video." });
    return;
  }

  await deleteVideoByKey(videoKey as string);

  res.status(HttpStatusCode.OK).send({ msg: "video deleted successfully." });
};

export const getVideoHandler: RequestHandler = async (req, res) => {
  const videoKey = req.params["videoKey"];

  const result = await getVideoDetails(req.user!.username, videoKey as string);

  const { cookies, ...data } = result;

  const {
    cloudFront: { domain },
  } = getAwsConfig();

  // setting signed cookies to Set-Cookie header
  Object.entries(cookies).forEach((val) => {
    const [key, value] = val;
    const cookie = `${key}=${value};Domain=${domain};Path=/outputs/${req.user?.username}/${videoKey}/;Secure;HttpOnly`;
    logger.debug({ cookie }, "Cookie value");
    res.setHeader("Set-Cookie", cookie);
  });

  res.status(HttpStatusCode.OK).send({ data });
};
