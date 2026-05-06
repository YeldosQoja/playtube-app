import type { RequestHandler } from "express";
import { requireAccount } from "#core/account/account.policy.js";
import type { ICommentService } from "#core/comment/comment.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function createCommentController(commentService: ICommentService) {
  return {
    create: (async (req, res) => {
      const account = requireAccount(req.account);
      const { videoPublicKey, text, parentId } = req.body;

      await commentService.createForVideo(account, {
        videoPublicKey,
        text,
        parentId,
      });

      res.status(HttpStatusCode.CREATED).send({
        msg: "Comment has been added to the video.",
      });
    }) satisfies RequestHandler,

    update: (async (req, res) => {
      const id = Number(req.params["id"]);
      const { text } = req.body;

      await commentService.updateById(id, text);

      res.status(HttpStatusCode.OK).send({
        msg: "Comment has been updated",
      });
    }) satisfies RequestHandler,
  };
}

export type CommentController = ReturnType<typeof createCommentController>;
