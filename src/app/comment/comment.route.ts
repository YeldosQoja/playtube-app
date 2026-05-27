import express from "express";
import type { RequestValidator } from "#middlewares/validate.js";
import { getCommentsSchema } from "#validators/comments/get-comments.schema.js";
import { createCommentSchema } from "#validators/comments/create-comment.schema.js";
import { updateCommentSchema } from "#validators/comments/update-comment.schema.js";
import type { CommentController } from "./comment.controller.js";

export function createCommentRouter(
  commentController: CommentController,
  requestValidator: RequestValidator,
) {
  const router = express.Router();

  router.get(
    "/list",
    requestValidator.validate(getCommentsSchema),
    commentController.list,
  );
  router.post(
    "/create",
    requestValidator.validate(createCommentSchema),
    commentController.create,
  );
  router.put(
    "/update/:id",
    requestValidator.validate(updateCommentSchema),
    commentController.update,
  );

  return router;
}
