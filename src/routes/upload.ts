import express from "express";
import { nanoid } from "nanoid";
import { S3Service } from "../services/aws/S3Service.js";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";
import logger from "../logger.js";
import AppError from "../utils/AppError.js";

const forcePathStyle = process.env["AWS_S3_FORCE_PATH_STYLE"] || false;

const router = express.Router();
const s3Service = new S3Service({ forcePathStyle: forcePathStyle === "true" });

router.post("/", async (req, res) => {
  const { contentType } = req.body;
  const key = nanoid();
  const command = s3Service.createSimpleUpload(key, contentType);
  const url = await s3Service.getSignedUrl(command);
  logger.info("Signed upload url created.");
  res.status(HttpStatusCode.OK).send({
    msg: "Success!",
    url,
    key,
  });
});

router.post("/multipart/start", async (req, res) => {
  const { user } = req;
  const { key, contentType, fileSize } = req.body;

  const fullKey = `uploads/${user!.username}/videos/${key}`;

  const partCount = Math.ceil(fileSize / 20_000_000);
  const command = s3Service.createMultipartUpload(fullKey, contentType);

  const { UploadId } = await s3Service.sendCommand(command);

  logger.info("Multipart upload started.");

  if (!UploadId) {
    throw new AppError(
      "Failed to create multipart upload - no UploadId returned",
      HttpStatusCode.BAD_REQUEST,
      false,
    );
  }

  const urls = await Promise.all(
    Array.from({ length: partCount }, async (_, i) => {
      const PartNumber = i + 1;
      const partCommand = s3Service.createPartUpload(
        fullKey,
        UploadId,
        PartNumber,
      );
      const url = await s3Service.getSignedUrl(partCommand);

      return { PartNumber, url };
    }),
  );

  logger.info("Signed Multipart upload urls created.");

  res.status(HttpStatusCode.OK).send({
    msg: "Multipart upload has successfully created.",
    uploadId: UploadId,
    urls,
  });
});

router.post("/multipart/complete", async (req, res) => {
  const { user } = req;
  const { uploadId, key, contentType, parts } = req.body;

  const fullKey = `uploads/${user!.username}/videos/${key}`;

  const command = s3Service.completeMultipartUpload(fullKey, uploadId, parts);

  await s3Service.client.send(command);

  logger.info("Multipart upload complete.");

  res
    .status(HttpStatusCode.OK)
    .send({ msg: `Multipart upload with id ${uploadId} has completed!` });
});

router.post("/multipart/abort", async (req, res) => {
  const { user } = req;
  const { uploadId, key } = req.body;

  if (!uploadId || !key) {
    throw new AppError(
      "uploadId and key are required",
      HttpStatusCode.BAD_REQUEST,
      false,
    );
  }

  const fullKey = `uploads/${user!.username}/videos/${key}`;
  const command = s3Service.abortMultipartUpload(fullKey, uploadId);

  const response = await s3Service.client.send(command);

  logger.info("Multipart upload aborted.");

  res.status(HttpStatusCode.OK).send({
    msg: `Multipart upload with id ${uploadId} has been cancelled successfully!`,
    data: response,
  });
});

export default router;
