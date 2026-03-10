import express from "express";
import { validate } from "../../middlewares/validate.js";
import { simpleUploadSchema } from "../../validators/upload/simple-upload.schema.js";
import { multipartStartSchema } from "../../validators/upload/multipart-start.schema.js";
import { multipartCompleteSchema } from "../../validators/upload/multipart-complete.schema.js";
import { multipartAbortSchema } from "../../validators/upload/multipart-abort.schema.js";
import {
  abortMultipartUploadHandler,
  completeMultipartUploadHandler,
  createSimpleUploadHandler,
  startMultipartUploadHandler,
} from "./upload.controller.js";

const router = express.Router();

router.post("/", validate(simpleUploadSchema), createSimpleUploadHandler);
router.post(
  "/multipart/start",
  validate(multipartStartSchema),
  startMultipartUploadHandler,
);
router.post(
  "/multipart/complete",
  validate(multipartCompleteSchema),
  completeMultipartUploadHandler,
);
router.post(
  "/multipart/abort",
  validate(multipartAbortSchema),
  abortMultipartUploadHandler,
);

export default router;
