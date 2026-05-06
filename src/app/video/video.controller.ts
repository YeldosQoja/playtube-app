import type { RequestHandler } from "express";
import { requireAccount } from "#core/account/account.policy.js";
import type { IVideoService } from "#core/video/video.service.js";
import logger from "#lib/logger.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function createVideoController(videoService: IVideoService) {
  return {
    createDraft: (async (req, res) => {
      const account = requireAccount(req.account);
      const { title } = req.body;
      const { key } = await videoService.createDraft(account, title);

      res.status(HttpStatusCode.OK).send({ key });
    }) satisfies RequestHandler,

    list: (async (req, res) => {
      const account = requireAccount(req.account);
      const videos = await videoService.listUploaded(account);

      res.status(HttpStatusCode.OK).send({ videos });
    }) satisfies RequestHandler,

    listCategories: (async (_req, res) => {
      const categories = await videoService.listCategories();

      res.status(HttpStatusCode.OK).send({ categories });
    }) satisfies RequestHandler,

    save: (async (req, res) => {
      const account = requireAccount(req.account);
      const videoKey = req.params["videoKey"] as string;
      const { playlist, tags, ...data } = req.body;

      await videoService.save(account, videoKey, {
        data,
        playlist,
        tags,
      });

      res.status(HttpStatusCode.OK).send({ msg: "The video has been created!" });
    }) satisfies RequestHandler,

    listComments: (async (req, res) => {
      const videoKey = req.params["videoKey"] as string;
      const limit = Number(req.query["limit"]);
      const offset = Number(req.query["offset"] ?? 0);
      const comments = await videoService.listComments(videoKey, limit, offset);

      res.status(HttpStatusCode.OK).send({
        msg: "Comments retrieved.",
        comments,
      });
    }) satisfies RequestHandler,

    delete: (async (req, res) => {
      const account = requireAccount(req.account);
      const videoKey = req.params["videoKey"] as string;

      await videoService.delete(account, videoKey);

      res.status(HttpStatusCode.OK).send({ msg: "video deleted successfully." });
    }) satisfies RequestHandler,

    get: (async (req, res) => {
      const account = requireAccount(req.account);
      const videoKey = req.params["videoKey"] as string;
      const result = await videoService.getDetails(account, videoKey);
      const { cookies, cookieDomain, cookiePath, ...data } = result;
      const domain = cookieDomain ? `Domain=${cookieDomain};` : "";
      const cookieHeaders = Object.entries(cookies).map(([key, value]) => {
        const cookie = `${key}=${value};${domain}Path=${cookiePath};Secure;HttpOnly`;
        logger.debug({ cookie }, "Cookie value");
        return cookie;
      });

      res.setHeader("Set-Cookie", cookieHeaders);

      res.status(HttpStatusCode.OK).send({ data });
    }) satisfies RequestHandler,
  };
}

export type VideoController = ReturnType<typeof createVideoController>;
