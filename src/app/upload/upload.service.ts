import { nanoid } from "nanoid";
import { S3Service } from "../../services/aws/S3Service.js";
import AppError from "../../utils/AppError.js";
import { HttpStatusCode } from "../../utils/HttpStatusCode.js";

const forcePathStyle = process.env["AWS_S3_FORCE_PATH_STYLE"] || false;
const s3Service = new S3Service({ forcePathStyle: forcePathStyle === "true" });
const PART_SIZE = 20_000_000;

export async function createSimpleUpload(contentType: string) {
  const key = nanoid();
  const command = s3Service.createSimpleUpload(key, contentType);
  const url = await s3Service.getSignedUrl(command);

  return { key, url };
}

export async function startMultipartUpload(
  username: string,
  key: string,
  contentType: string,
  fileSize: number,
) {
  const fullKey = `uploads/${username}/videos/${key}`;
  const partCount = Math.ceil(fileSize / PART_SIZE);
  const command = s3Service.createMultipartUpload(fullKey, contentType);

  const { UploadId } = await s3Service.sendCommand(command);

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

  return { uploadId: UploadId, urls };
}

export async function completeMultipartUpload(
  username: string,
  uploadId: string,
  key: string,
  parts: { ETag: string; PartNumber: number }[],
) {
  const fullKey = `uploads/${username}/videos/${key}`;
  const command = s3Service.completeMultipartUpload(fullKey, uploadId, parts);

  await s3Service.client.send(command);
}

export async function abortMultipartUpload(
  username: string,
  uploadId: string,
  key: string,
) {
  const fullKey = `uploads/${username}/videos/${key}`;
  const command = s3Service.abortMultipartUpload(fullKey, uploadId);

  return await s3Service.client.send(command);
}
