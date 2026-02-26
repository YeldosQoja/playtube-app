import express from "express";
import { nanoid } from "nanoid";
import { S3Service } from "../services/aws/S3Service.js";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";

const router = express.Router();
const s3Service = new S3Service();

router.post("/", async (req, res) => {
  const { contentType } = req.body;
  const key = nanoid();
  const command = s3Service.createSimpleUpload(key, contentType);
  const url = await s3Service.getSignedUrl(command);
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

  if (!UploadId) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "Failed to create multipart upload - no UploadId returned",
    });
    return;
  }

  const urls = await Promise.all(
    Array.from({ length: partCount }, async (_, i) => {
      const PartNumber = i + 1;
      const partCommand = s3Service.createPartUpload(fullKey, UploadId, PartNumber);
      const url = await s3Service.getSignedUrl(partCommand);

      return { PartNumber, url };
    })
  );

  res.status(HttpStatusCode.OK).send({
    msg: "Multipart upload has successfully created!",
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

  res
    .status(HttpStatusCode.OK)
    .send({ msg: `Multipart upload with id ${uploadId} has completed!` });
});

router.post("/multipart/abort", async (req, res) => {
  const { user } = req;
  const { uploadId, key } = req.body;

  if (!uploadId || !key) {
    res.status(HttpStatusCode.BAD_REQUEST).send({
      err: "uploadId and key are required",
    });
    return;
  }

  const fullKey = `uploads/${user!.username}/videos/${key}`;
  const command = s3Service.abortMultipartUpload(fullKey, uploadId);

  const response = await s3Service.client.send(command);

  res.status(HttpStatusCode.OK).send({
    msg: `Multipart upload with id ${uploadId} has been cancelled successfully!`,
    data: response,
  });
});

export default router;
