import type { Account } from "#core/account/account.repository.js";
import type { CompletedUploadPart, MultipartUploadUrl } from "./upload.storage.js";

export interface IUploadService {
  createSimpleUpload(
    account: Account,
    contentType?: string,
  ): Promise<{ key: string; url: string }>;
  startMultipartUpload(
    account: Account,
    key: string,
    contentType: string,
    fileSize: number,
  ): Promise<{ uploadId: string; urls: MultipartUploadUrl[] }>;
  completeMultipartUpload(
    account: Account,
    uploadId: string,
    key: string,
    parts: CompletedUploadPart[],
  ): Promise<void>;
  abortMultipartUpload(
    account: Account,
    uploadId: string,
    key: string,
  ): Promise<unknown>;
}
