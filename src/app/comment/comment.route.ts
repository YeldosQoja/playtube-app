import express from "express";
import { validate } from "#middlewares/validate.js";
import { createCommentSchema } from "#validators/comments/create-comment.schema.js";
import { updateCommentSchema } from "#validators/comments/update-comment.schema.js";
import type { CommentController } from "./comment.controller.js";

export function createCommentRouter(commentController: CommentController) {
  const router = express.Router();

  router.post("/create", validate(createCommentSchema), commentController.create);
  router.put(
    "/update/:id",
    validate(updateCommentSchema),
    commentController.update,
  );

  return router;
}
