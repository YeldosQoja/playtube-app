export interface UploadSession {
  uploadUrl: string;
}

export interface MultipartUploadSession {
  id: string;
  partUploadUrls: string[];
}

export interface CompletedUploadPart {
  partNumber: number;
  ETag: string;
}

export interface VideoUploadPort {
  createUploadSession(
    uploadPath: string,
    contentType?: string,
  ): Promise<UploadSession>;

  createMultipartUploadSession(
    uploadPath: string,
    contentType: string,
    partCount: number,
  ): Promise<MultipartUploadSession>;

  completeMultipartUploadSession(
    id: string,
    uploadPath: string,
    parts: CompletedUploadPart[],
  ): Promise<void>;

  abortMultipartUploadSession(id: string, uploadPath: string): Promise<void>;
}
