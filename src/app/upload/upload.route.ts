import express from "express";
import type { RequestValidator } from "#middlewares/validate.js";
import { abortMultipartUploadSchema } from "#validators/upload/abort-multipart-upload.schema.js";
import { completeMultipartUploadSchema } from "#validators/upload/complete-multipart-upload.schema.js";
import { createUploadSessionSchema } from "#validators/upload/create-upload-session.schema.js";
import type { UploadController } from "./upload.controller.js";

export function createUploadRouter(
  uploadController: UploadController,
  requestValidator: RequestValidator,
) {
  const router = express.Router();

  router.post(
    "/create",
    requestValidator.validate(createUploadSessionSchema),
    uploadController.createUploadSession,
  );
  router.post(
    "/multipart/complete",
    requestValidator.validate(completeMultipartUploadSchema),
    uploadController.completeMultipartUpload,
  );
  router.post(
    "/multipart/abort",
    requestValidator.validate(abortMultipartUploadSchema),
    uploadController.abortMultipartUpload,
  );

  return router;
}
