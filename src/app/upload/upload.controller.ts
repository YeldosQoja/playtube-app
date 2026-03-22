import type { RequestHandler } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createSimpleUpload,
  startMultipartUpload,
} from "./upload.service.js";

export const createSimpleUploadHandler: RequestHandler = async (req, res) => {
  const { contentType } = req.body;
  const { url, key } = await createSimpleUpload(
    req.user!.username,
    contentType,
  );

  logger.info("Signed upload url created.");
  res.status(HttpStatusCode.OK).send({
    msg: "Success!",
    url,
    key,
  });
};

export const startMultipartUploadHandler: RequestHandler = async (req, res) => {
  const { user } = req;
  const { key, contentType, fileSize } = req.body;

  const { uploadId, urls } = await startMultipartUpload(
    user!.username,
    key,
    contentType,
    fileSize,
  );

  logger.info("Multipart upload started.");
  logger.info("Signed Multipart upload urls created.");

  res.status(HttpStatusCode.OK).send({
    msg: "Multipart upload has successfully created.",
    uploadId,
    urls,
  });
};

export const completeMultipartUploadHandler: RequestHandler = async (
  req,
  res,
) => {
  const { user } = req;
  const { uploadId, key, parts } = req.body;

  await completeMultipartUpload(user!.username, uploadId, key, parts);

  logger.info("Multipart upload complete.");

  res
    .status(HttpStatusCode.OK)
    .send({ msg: `Multipart upload with id ${uploadId} has completed!` });
};

export const abortMultipartUploadHandler: RequestHandler = async (req, res) => {
  const { user } = req;
  const { uploadId, key } = req.body;

  const response = await abortMultipartUpload(user!.username, uploadId, key);

  logger.info("Multipart upload aborted.");

  res.status(HttpStatusCode.OK).send({
    msg: `Multipart upload with id ${uploadId} has been cancelled successfully!`,
    data: response,
  });
};
