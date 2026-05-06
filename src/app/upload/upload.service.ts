import { nanoid } from "nanoid";
import type { Account } from "#core/account/account.repository.js";
import {
  thumbnailUploadPath,
  UPLOAD_PART_SIZE_BYTES,
  videoUploadPath,
} from "#core/upload/upload.policy.js";
import type { IUploadService } from "#core/upload/upload.service.js";
import type {
  CompletedUploadPart,
  IUploadStorage,
} from "#core/upload/upload.storage.js";

export class UploadService implements IUploadService {
  constructor(private readonly uploadStorage: IUploadStorage) {}

  async createSimpleUpload(account: Account, contentType?: string) {
    const key = nanoid();
    const fullKey = thumbnailUploadPath(account.username, key);
    const url = await this.uploadStorage.createSimpleUpload(
      fullKey,
      contentType,
    );

    return { key, url };
  }

  async startMultipartUpload(
    account: Account,
    key: string,
    contentType: string,
    fileSize: number,
  ) {
    const fullKey = videoUploadPath(account.username, key);
    const partCount = Math.ceil(fileSize / UPLOAD_PART_SIZE_BYTES);
    const uploadId = await this.uploadStorage.startMultipartUpload(
      fullKey,
      contentType,
    );

    const urls = await Promise.all(
      Array.from({ length: partCount }, async (_, index) => {
        const PartNumber = index + 1;
        const url = await this.uploadStorage.createPartUploadUrl(
          fullKey,
          uploadId,
          PartNumber,
        );

        return { PartNumber, url };
      }),
    );

    return { uploadId, urls };
  }

  async completeMultipartUpload(
    account: Account,
    uploadId: string,
    key: string,
    parts: CompletedUploadPart[],
  ): Promise<void> {
    const fullKey = videoUploadPath(account.username, key);
    await this.uploadStorage.completeMultipartUpload(fullKey, uploadId, parts);
  }

  async abortMultipartUpload(account: Account, uploadId: string, key: string) {
    const fullKey = videoUploadPath(account.username, key);
    return await this.uploadStorage.abortMultipartUpload(fullKey, uploadId);
  }
}
