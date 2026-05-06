import type { RequestHandler } from "express";
import { requireAccount } from "#core/account/account.policy.js";
import type { IUploadService } from "#core/upload/upload.service.js";
import logger from "#lib/logger.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function createUploadController(uploadService: IUploadService) {
  return {
    createSimple: (async (req, res) => {
      const account = requireAccount(req.account);
      const { contentType } = req.body;
      const { url, key } = await uploadService.createSimpleUpload(
        account,
        contentType,
      );

      logger.info("Signed upload url created.");
      res.status(HttpStatusCode.OK).send({
        msg: "Success!",
        url,
        key,
      });
    }) satisfies RequestHandler,

    startMultipart: (async (req, res) => {
      const account = requireAccount(req.account);
      const { key, contentType, fileSize } = req.body;
      const { uploadId, urls } = await uploadService.startMultipartUpload(
        account,
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
    }) satisfies RequestHandler,

    completeMultipart: (async (req, res) => {
      const account = requireAccount(req.account);
      const { uploadId, key, parts } = req.body;

      await uploadService.completeMultipartUpload(account, uploadId, key, parts);

      logger.info("Multipart upload complete.");

      res
        .status(HttpStatusCode.OK)
        .send({ msg: `Multipart upload with id ${uploadId} has completed!` });
    }) satisfies RequestHandler,

    abortMultipart: (async (req, res) => {
      const account = requireAccount(req.account);
      const { uploadId, key } = req.body;
      const response = await uploadService.abortMultipartUpload(
        account,
        uploadId,
        key,
      );

      logger.info("Multipart upload aborted.");

      res.status(HttpStatusCode.OK).send({
        msg: `Multipart upload with id ${uploadId} has been cancelled successfully!`,
        data: response,
      });
    }) satisfies RequestHandler,
  };
}

export type UploadController = ReturnType<typeof createUploadController>;
