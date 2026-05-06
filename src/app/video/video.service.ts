import { nanoid } from "nanoid";
import type { Account } from "#core/account/account.repository.js";
import { videoOutputPath, thumbnailUploadPath } from "#core/upload/upload.policy.js";
import type { IVideoAssetService } from "#core/video/video.asset-service.js";
import { ensureCanManageVideo } from "#core/video/video.policy.js";
import type {
  IVideoRepository,
  UpdateVideoInput,
  VideoCategory,
  VideoListRecord,
} from "#core/video/video.repository.js";
import type {
  IVideoService,
  SaveVideoInput,
  VideoPlaybackDetails,
} from "#core/video/video.service.js";
import logger from "#lib/logger.js";

const SIGNED_ASSET_EXPIRATION = 3_600;

export class VideoService implements IVideoService {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly assetService: IVideoAssetService,
  ) {}

  async createDraft(account: Account, title: string): Promise<{ key: string }> {
    const videoKey = nanoid();

    await this.videoRepository.createDraft({
      author: account.id,
      key: videoKey,
      title,
      privacy: "private",
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    });

    return { key: videoKey };
  }

  async listUploaded(
    account: Account,
  ): Promise<(VideoListRecord & { thumbnailUrl: string | null })[]> {
    const videos = await this.videoRepository.listUploaded();

    return await Promise.all(
      videos.map(async (video) => {
        if (!video.thumbnailKey) {
          return { ...video, thumbnailUrl: null };
        }

        const thumbnailPath = thumbnailUploadPath(
          video.authorProfile.username || account.username,
          video.thumbnailKey,
        );
        const thumbnailUrl = await this.assetService.generateSignedUrl(
          thumbnailPath,
          Date.now() + SIGNED_ASSET_EXPIRATION,
        );

        return { ...video, thumbnailUrl };
      }),
    );
  }

  async listCategories(): Promise<VideoCategory[]> {
    return await this.videoRepository.listCategories();
  }

  async save(
    account: Account,
    videoKey: string,
    input: SaveVideoInput,
  ): Promise<void> {
    const video = await this.videoRepository.findByKey(videoKey);
    ensureCanManageVideo(account, video);

    const tagNames = (input.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const updates: UpdateVideoInput = {
      ...input.data,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.videoRepository.updateByKey(
      videoKey,
      updates,
      input.playlist,
      tagNames,
    );
  }

  async listComments(videoKey: string, limit: number, offset: number) {
    const video = await this.videoRepository.findByKey(videoKey);
    return await this.videoRepository.listCommentsByVideoId(
      video.id,
      limit,
      offset,
    );
  }

  async delete(account: Account, videoKey: string): Promise<void> {
    const video = await this.videoRepository.findByKey(videoKey);
    ensureCanManageVideo(account, video);
    await this.videoRepository.deleteByKey(videoKey);
  }

  async getDetails(
    account: Account,
    videoKey: string,
  ): Promise<VideoPlaybackDetails> {
    const video = await this.videoRepository.findDetailsByKey(videoKey);
    const ownerUsername = video.authorProfile.username || account.username;
    const outputPath = videoOutputPath(ownerUsername, video.key);
    const cookiePath = `/${outputPath}/`;
    const cookies = await this.assetService.createSignedCookies(
      `${outputPath}/*`,
      Date.now() + SIGNED_ASSET_EXPIRATION,
    );
    const baseUrl = this.assetService.getBaseUrl();
    const videoUrl = `${baseUrl}/${outputPath}/output.m3u8`;
    const thumbnailKey = video.thumbnailKey ?? video.key;
    const thumbnailUrl = `${baseUrl}/${thumbnailUploadPath(
      ownerUsername,
      thumbnailKey,
    )}`;

    logger.info({ cookies, thumbnailUrl }, "Video and thumbnail urls generated.");

    const cookieDomain = this.assetService.getCookieDomain();

    return {
      ...video,
      cookies,
      cookiePath,
      videoUrl,
      thumbnailUrl,
      ...(cookieDomain ? { cookieDomain } : {}),
    };
  }
}
