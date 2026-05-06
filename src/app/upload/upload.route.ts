import express from "express";
import { validate } from "#middlewares/validate.js";
import { multipartAbortSchema } from "#validators/upload/multipart-abort.schema.js";
import { multipartCompleteSchema } from "#validators/upload/multipart-complete.schema.js";
import { multipartStartSchema } from "#validators/upload/multipart-start.schema.js";
import { simpleUploadSchema } from "#validators/upload/simple-upload.schema.js";
import type { UploadController } from "./upload.controller.js";

export function createUploadRouter(uploadController: UploadController) {
  const router = express.Router();

  router.post("/simple", validate(simpleUploadSchema), uploadController.createSimple);
  router.post(
    "/multipart/start",
    validate(multipartStartSchema),
    uploadController.startMultipart,
  );
  router.post(
    "/multipart/complete",
    validate(multipartCompleteSchema),
    uploadController.completeMultipart,
  );
  router.post(
    "/multipart/abort",
    validate(multipartAbortSchema),
    uploadController.abortMultipart,
  );

  return router;
}
