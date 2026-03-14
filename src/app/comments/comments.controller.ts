import type { RequestHandler } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import {
  createCommentForVideo,
  updateCommentById,
} from "./comments.service.js";

export const createCommentHandler: RequestHandler = async (req, res) => {
  const { videoPublicKey, text, parentId } = req.body;

  await createCommentForVideo({
    authorId: req.user!.id,
    videoPublicKey,
    text,
    parentId,
  });

  res.status(HttpStatusCode.CREATED).send({
    msg: "Comment has been added to the video.",
  });
};

export const updateCommentHandler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  const { text } = req.body;

  await updateCommentById(id, text);

  res.status(HttpStatusCode.OK).send({
    msg: "Comment has been updated",
  });
};
