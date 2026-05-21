import type { RequestHandler } from "express";
import { UploadService } from "#components/upload/upload.service.js";
import logger from "#lib/logger.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { nanoid } from "nanoid";
import { CreateUploadSessionBody } from "#validators/upload/create-upload-session.schema.js";
import { CompleteMultipartUploadBody } from "#validators/upload/complete-multipart-upload.schema.js";

export function createUploadController(uploadService: UploadService) {
  return {
    createUploadSession: (async (req, res) => {
      const { contentType } = req.body as CreateUploadSessionBody;
      const key = nanoid();
      const { url } = await uploadService.createUploadSession({
        authUserId: req.user.id,
        key,
        contentType,
      });

      logger.info("Signed upload url created.");
      res.status(HttpStatusCode.OK).send({
        msg: "Success!",
        url,
        key,
      });
    }) satisfies RequestHandler,
    completeMultipartUpload: (async (req, res) => {
      const { uploadSessionId, key, parts } =
        req.body as CompleteMultipartUploadBody;

      await uploadService.completeMultipartUploadSession({
        userId: req.user.id,
        sessionId: uploadSessionId,
        key,
        parts,
      });

      logger.info("Multipart upload complete.");

      res.status(HttpStatusCode.OK).send({
        msg: `Multipart upload session ${uploadSessionId} has completed!`,
      });
    }) satisfies RequestHandler,

    abortMultipartUpload: (async (req, res) => {
      const { uploadSessionId, key } = req.body;
      await uploadService.abortMultipartUploadSession({
        sessionId: uploadSessionId,
        key,
        userId: req.user.id,
      });

      logger.info("Multipart upload aborted.");

      res.status(HttpStatusCode.OK).send({
        msg: `Multipart upload session ${uploadSessionId} has been cancelled successfully!`,
      });
    }) satisfies RequestHandler,
  };
}

export type UploadController = ReturnType<typeof createUploadController>;
