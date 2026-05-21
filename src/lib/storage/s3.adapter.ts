import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAwsConfig } from "#config/aws.js";
import type {
  CompletedUploadPart,
  MultipartUploadSession,
  UploadSession,
  VideoUploadPort,
} from "#components/upload/ports/video-upload.port.js";
import logger from "#lib/logger.js";

export class S3Adapter implements VideoUploadPort {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(config?: S3ClientConfig) {
    this.client = new S3Client(config ?? {});
    this.bucketName = getAwsConfig().s3.bucketName;
  }

  async createUploadSession(
    uploadPath: string,
    contentType?: string,
  ): Promise<UploadSession> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uploadPath,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command);

    return { uploadUrl };
  }

  async createMultipartUploadSession(
    uploadPath: string,
    contentType: string,
    partCount: number,
  ): Promise<MultipartUploadSession> {
    if (!Number.isInteger(partCount) || partCount <= 0) {
      throw new Error(
        "Multipart upload part count must be a positive integer.",
      );
    }

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: uploadPath,
      ContentType: contentType,
    });

    logger.info(
      { bucket: this.bucketName, uploadPath },
      "Video upload session requested.",
    );

    const { UploadId } = await this.client.send(command);

    if (!UploadId) {
      throw new Error("Failed to start video upload session.");
    }

    const partUploadUrls = await Promise.all(
      Array.from({ length: partCount }, async (_, index) => {
        const partNumber = index + 1;
        const partCommand = new UploadPartCommand({
          Bucket: this.bucketName,
          Key: uploadPath,
          UploadId,
          PartNumber: partNumber,
        });
        const url = await getSignedUrl(this.client, partCommand);

        return url;
      }),
    );

    return {
      id: UploadId,
      partUploadUrls,
    };
  }

  async completeMultipartUploadSession(
    id: string,
    uploadPath: string,
    parts: CompletedUploadPart[],
  ): Promise<void> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: uploadPath,
      UploadId: id,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.ETag,
          PartNumber: part.partNumber,
        })),
      },
    });

    await this.client.send(command);
  }

  async abortMultipartUploadSession(
    id: string,
    uploadPath: string,
  ): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: uploadPath,
      UploadId: id,
    });

    await this.client.send(command);
  }
}
