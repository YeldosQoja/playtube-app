import { IAccountRepository } from "#components/account/domain/account.repository.js";
import { AuthUserId } from "#components/account/domain/value-objects.js";
import type { VideoUploadPort } from "./ports/video-upload.port.js";
import { thumbnailUploadPath, videoUploadPath } from "./upload.policy.js";

export interface CreateUploadSessionInputDTO {
  authUserId: string;
  key: string;
  contentType: string;
}

export interface CreateUploadSessionResultDTO {
  url: string;
}

export interface CreateMultipartUploadSessionInputDTO {
  username: string;
  key: string;
  fileSize: number;
  contentType: string;
}

export interface CreateMultipartUploadSessionResultDTO {
  sessionId: string;
  urls: string[];
}

export interface CompleteMultipartUploadSessionInputDTO {
  sessionId: string;
  userId: string;
  key: string;
  parts: {
    ETag: string;
    partNumber: number;
  }[];
}

export interface AbortMultipartUploadSessionInputDTO {
  sessionId: string;
  userId: string;
  key: string;
}

export class UploadService {
  constructor(
    private accountRepository: IAccountRepository,
    private videoUploadPort: VideoUploadPort,
  ) {}

  async createUploadSession(
    input: CreateUploadSessionInputDTO,
  ): Promise<CreateUploadSessionResultDTO> {
    const { contentType, key, authUserId } = input;
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(authUserId),
    );

    const path = thumbnailUploadPath(account.getUsername().value, key);
    const { uploadUrl } = await this.videoUploadPort.createUploadSession(
      path,
      contentType,
    );

    return { url: uploadUrl };
  }

  async createMultipartUploadSession(
    input: CreateMultipartUploadSessionInputDTO,
  ): Promise<CreateMultipartUploadSessionResultDTO> {
    const { username, key, contentType, fileSize } = input;
    const path = videoUploadPath(username, key);

    const { id, partUploadUrls } =
      await this.videoUploadPort.createMultipartUploadSession(
        path,
        contentType,
        20,
      );

    return { sessionId: id, urls: partUploadUrls };
  }

  async completeMultipartUploadSession(
    input: CompleteMultipartUploadSessionInputDTO,
  ): Promise<void> {
    const { userId, key, sessionId, parts } = input;
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );
    const path = videoUploadPath(account.getUsername().value, key);

    await this.videoUploadPort.completeMultipartUploadSession(
      sessionId,
      path,
      parts,
    );
  }

  async abortMultipartUploadSession(
    input: AbortMultipartUploadSessionInputDTO,
  ): Promise<void> {
    const { userId, sessionId, key } = input;
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );
    const path = videoUploadPath(account.getUsername().value, key);

    await this.videoUploadPort.abortMultipartUploadSession(sessionId, path);
  }
}
