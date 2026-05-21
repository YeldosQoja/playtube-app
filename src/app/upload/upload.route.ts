import express from "express";
import { validate } from "#middlewares/validate.js";
import { abortMultipartUploadSchema } from "#validators/upload/abort-multipart-upload.schema.js";
import { completeMultipartUploadSchema } from "#validators/upload/complete-multipart-upload.schema.js";
import { createUploadSessionSchema } from "#validators/upload/create-upload-session.schema.js";
import type { UploadController } from "./upload.controller.js";

export function createUploadRouter(uploadController: UploadController) {
  const router = express.Router();

  router.post(
    "/create",
    validate(createUploadSessionSchema),
    uploadController.createUploadSession,
  );
  router.post(
    "/multipart/complete",
    validate(completeMultipartUploadSchema),
    uploadController.completeMultipartUpload,
  );
  router.post(
    "/multipart/abort",
    validate(abortMultipartUploadSchema),
    uploadController.abortMultipartUpload,
  );

  return router;
}
