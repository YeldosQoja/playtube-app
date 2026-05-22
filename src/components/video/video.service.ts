import {
  AccountId,
  AuthUserId,
} from "#components/account/domain/value-objects.js";
import { nanoid } from "nanoid";
import {
  ThumbnailKey,
  VideoAudience,
  VideoCategoryId,
  VideoDescription,
  VideoKey,
  VideoPermissions,
  VideoPrivacy,
  VideoTag,
  VideoTitle,
} from "./domain/value-objects.js";
import { VideoFactory } from "./domain/video.factory.js";
import { IVideoRepository } from "./domain/video.repository.js";
import { VideoAccessPort } from "./ports/video-access.port.js";
import { IAccountRepository } from "#components/account/domain/account.repository.js";
import {
  thumbnailUploadPath,
  videoOutputPath,
} from "#components/upload/upload.policy.js";
import { PlaylistId } from "#components/playlist/domain/value-objects.js";
import { getAwsConfig } from "#config/aws.js";
import logger from "#lib/logger.js";
import { UploadService } from "#components/upload/upload.service.js";

export type VideoDetailsDTO = {
  id: number;
  authorId: number;
  thumbnailUrl: string;
  cookies?: Record<string, string>;
  cookiePath?: string;
  cookieDomain?: string;
  videoUrl?: string;
};

export type CreateDraftInputDTO = {
  userId: string;
  title: string;
  contentType: string;
  fileSize: number;
};

export type CreateDraftResultDTO = {
  key: string;
  upload: {
    sessionId: string;
    urls: string[];
  };
};

export type SaveVideoInputDTO = {
  key: string;
  title: string;
  desc: string;
  thumbnailKey: string;
  categoryId: number;
  playlistId?: number;
  tags: string[];
  allowComments: boolean;
  allowDownloads: boolean;
  isForKids: boolean;
  isAgeRestricted: boolean;
  privacy: "public" | "private" | "unlisted";
};

export class VideoService {
  constructor(
    private videoFactory: VideoFactory,
    private videoRepository: IVideoRepository,
    private videoAccessPort: VideoAccessPort,
    private accountRepository: IAccountRepository,
    private uploadService: UploadService,
  ) {}

  async createDraft(input: CreateDraftInputDTO): Promise<CreateDraftResultDTO> {
    const { userId, title, contentType, fileSize } = input;

    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );

    const id = await this.videoRepository.nextId();
    const videoKey = nanoid();
    const video = this.videoFactory.create(
      id,
      account.getId(),
      new VideoKey(videoKey),
      new VideoTitle(title),
    );

    await this.videoRepository.add(video);

    const { sessionId, urls } =
      await this.uploadService.createMultipartUploadSession({
        contentType,
        fileSize,
        key: videoKey,
        username: account.getUsername().value,
      });

    return {
      key: videoKey,
      upload: {
        sessionId,
        urls,
      },
    };
  }

  async listUploaded(): Promise<VideoDetailsDTO[]> {
    const videos = await this.videoRepository.list();

    return await Promise.all(
      videos.map(async (video) => {
        const authorId = video.getAuthorId().value;
        const account = await this.accountRepository.findById(
          new AccountId(authorId),
        );
        const username = account.getUsername().value;
        const thumbnailKey = video.getThumbnailKey()!.value;

        const thumbnailPath = thumbnailUploadPath(username, thumbnailKey);
        const credentials = await this.videoAccessPort.authorize(thumbnailPath);

        if (credentials.type !== "signed_url") {
          throw new Error("Expected signed URL credentials for thumbnail.");
        }

        return {
          id: video.getId().value,
          authorId,
          thumbnailUrl: credentials.url,
        };
      }),
    );
  }

  async save(input: SaveVideoInputDTO): Promise<void> {
    const {
      key,
      title,
      desc,
      thumbnailKey,
      categoryId,
      playlistId,
      isAgeRestricted,
      isForKids,
      allowComments,
      allowDownloads,
      tags,
      privacy,
    } = input;

    const video = await this.videoRepository.findByKey(new VideoKey(key));

    video.saveMetadata(
      new VideoTitle(title),
      new VideoDescription(desc),
      new ThumbnailKey(thumbnailKey),
      playlistId ? new PlaylistId(playlistId) : null,
      new VideoCategoryId(categoryId),
      new VideoAudience(isForKids, isAgeRestricted),
      new VideoPermissions(allowComments, allowDownloads),
      new VideoPrivacy(privacy),
      tags.map((tag) => new VideoTag(tag)),
    );

    await this.videoRepository.save(video);
  }

  async delete(key: string): Promise<void> {
    await this.videoRepository.deleteByKey(new VideoKey(key));
  }

  async getVideoDetails(key: string): Promise<VideoDetailsDTO> {
    const video = await this.videoRepository.findByKey(new VideoKey(key));

    const account = await this.accountRepository.findById(
      new AccountId(video.getAuthorId().value),
    );
    const username = account.getUsername().value;

    const outputPath = videoOutputPath(username, key);
    const cookiePath = `/${outputPath}/`;
    const credentials = await this.videoAccessPort.authorize(`${outputPath}/*`);

    if (credentials.type !== "signed_cookies") {
      throw new Error("Expected signed cookie credentials for video playback.");
    }

    const baseUrl = getAwsConfig().cloudFront.baseUrl;
    const videoUrl = `${baseUrl}/${outputPath}/output.m3u8`;
    const thumbnailKey = video.getThumbnailKey()!.value;
    const thumbnailUrl = `${baseUrl}/${thumbnailUploadPath(
      username,
      thumbnailKey,
    )}`;

    logger.info(
      { cookies: credentials.cookies, thumbnailUrl },
      "Video and thumbnail urls generated.",
    );

    const cookieDomain = getAwsConfig().cloudFront.domain;

    return {
      id: video.getId().value,
      authorId: video.getAuthorId().value,
      cookies: credentials.cookies,
      cookiePath,
      videoUrl,
      thumbnailUrl,
      ...(cookieDomain ? { cookieDomain } : {}),
    };
  }
}
