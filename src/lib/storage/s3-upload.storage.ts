import type { S3ClientConfig } from "@aws-sdk/client-s3";
import type {
  CompletedUploadPart,
  IUploadStorage,
} from "#core/upload/upload.storage.js";
import { S3Service } from "#services/aws/S3Service.js";

export class S3UploadStorage implements IUploadStorage {
  private readonly s3Service: S3Service;

  constructor(config?: S3ClientConfig) {
    this.s3Service = new S3Service(config);
  }

  async createSimpleUpload(key: string, contentType?: string): Promise<string> {
    const command = this.s3Service.createSimpleUpload(key, contentType);
    return await this.s3Service.getSignedUrl(command);
  }

  async startMultipartUpload(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = this.s3Service.createMultipartUpload(key, contentType);
    const { UploadId } = await this.s3Service.sendCommand(command);

    if (!UploadId) {
      throw new Error("Failed to create multipart upload.");
    }

    return UploadId;
  }

  async createPartUploadUrl(
    key: string,
    uploadId: string,
    partNumber: number,
  ): Promise<string> {
    const command = this.s3Service.createPartUpload(key, uploadId, partNumber);
    return await this.s3Service.getSignedUrl(command);
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: CompletedUploadPart[],
  ): Promise<void> {
    const command = this.s3Service.completeMultipartUpload(key, uploadId, parts);
    await this.s3Service.client.send(command);
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<unknown> {
    const command = this.s3Service.abortMultipartUpload(key, uploadId);
    return await this.s3Service.client.send(command);
  }
}
