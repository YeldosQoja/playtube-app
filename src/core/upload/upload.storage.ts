export interface CompletedUploadPart {
  ETag: string;
  PartNumber: number;
}

export interface MultipartUploadUrl {
  PartNumber: number;
  url: string;
}

export interface IUploadStorage {
  createSimpleUpload(key: string, contentType?: string): Promise<string>;
  startMultipartUpload(key: string, contentType: string): Promise<string>;
  createPartUploadUrl(
    key: string,
    uploadId: string,
    partNumber: number,
  ): Promise<string>;
  completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: CompletedUploadPart[],
  ): Promise<void>;
  abortMultipartUpload(key: string, uploadId: string): Promise<unknown>;
}
