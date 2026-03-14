import express from "express";
import { validate } from "#middlewares/validate.js";
import { createCommentSchema } from "#validators/comments/create-comment.schema.js";
import { updateCommentSchema } from "#validators/comments/update-comment.schema.js";
import {
  createCommentHandler,
  updateCommentHandler,
} from "./comments.controller.js";

const router = express.Router();

router.post("/", validate(createCommentSchema), createCommentHandler);
router.put("/:id", validate(updateCommentSchema), updateCommentHandler);

export default router;
