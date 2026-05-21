import type { RequestHandler } from "express";
import { CommentService } from "#components/comment/comment.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { GetCommentsQuery } from "#validators/comments/get-comments.schema.js";
import { CreateCommentBody } from "#validators/comments/create-comment.schema.js";
import {
  UpdateCommentBody,
  UpdateCommentParams,
} from "#validators/comments/update-comment.schema.js";

export function createCommentController(commentService: CommentService) {
  return {
    list: (async (req, res) => {
      const { videoId, parentCommentId, page, perPage } =
        req.query as unknown as GetCommentsQuery;
      const comments = await commentService.getComments({
        videoId,
        parentId: parentCommentId,
        page,
        perPage,
      });

      res.status(HttpStatusCode.OK).send({
        msg: "Comments retrieved.",
        comments,
      });
    }) satisfies RequestHandler,

    create: (async (req, res) => {
      const { videoId, text, parentId } = req.body as CreateCommentBody;

      await commentService.addComment({
        userId: req.user.id,
        videoId,
        content: text,
        parentId: parentId ?? null,
      });

      res.status(HttpStatusCode.CREATED).send({
        msg: "Comment has been added to the video.",
      });
    }) satisfies RequestHandler,

    update: (async (req, res) => {
      const { id } = req.params as unknown as UpdateCommentParams;
      const { text } = req.body as UpdateCommentBody;

      await commentService.updateComment(id, text);

      res.status(HttpStatusCode.OK).send({
        msg: "Comment has been updated",
      });
    }) satisfies RequestHandler,
  };
}

export type CommentController = ReturnType<typeof createCommentController>;
