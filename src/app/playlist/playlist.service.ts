import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import type { Account } from "#core/account/account.repository.js";
import { ensureCanManagePlaylist } from "#core/playlist/playlist.policy.js";
import type {
  CreatePlaylistForAccountInput,
  IPlaylistService,
} from "#core/playlist/playlist.service.js";
import type {
  IPlaylistRepository,
  PlaylistDetails,
  PlaylistRecord,
  PlaylistSummary,
  UpdatePlaylistInput,
} from "#core/playlist/playlist.repository.js";
import { ensureCanManageVideo } from "#core/video/video.policy.js";
import type { IVideoRepository } from "#core/video/video.repository.js";

export class PlaylistService implements IPlaylistService {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly videoRepository: IVideoRepository,
  ) {}

  async create(
    account: Account,
    data: CreatePlaylistForAccountInput,
  ): Promise<PlaylistRecord> {
    const thumbnail = data.thumbnailStorageKey || data.thumbnailKey;

    if (!thumbnail) {
      throw new AppError(
        "Thumbnail key is required.",
        HttpStatusCode.BAD_REQUEST,
        false,
      );
    }

    return await this.playlistRepository.create({
      author: account.id,
      title: data.title,
      thumbnailStorageKey: thumbnail,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      ...(data.desc !== undefined ? { desc: data.desc } : {}),
    });
  }

  async list(account: Account): Promise<PlaylistSummary[]> {
    return await this.playlistRepository.listByAuthor(account.id);
  }

  async get(account: Account, id: number): Promise<PlaylistDetails> {
    const playlist = await this.playlistRepository.findById(id);
    ensureCanManagePlaylist(account, playlist);
    return playlist;
  }

  async update(
    account: Account,
    id: number,
    data: UpdatePlaylistInput & { thumbnailKey?: string },
  ): Promise<PlaylistRecord> {
    const playlist = await this.playlistRepository.findById(id);
    ensureCanManagePlaylist(account, playlist);

    const thumbnail = data.thumbnailStorageKey || data.thumbnailKey;
    const updates: UpdatePlaylistInput = {
      lastUpdatedAt: new Date().toISOString(),
    };

    if (data.title) {
      updates.title = data.title;
    }
    if (data.desc !== undefined) {
      updates.desc = data.desc;
    }
    if (thumbnail) {
      updates.thumbnailStorageKey = thumbnail;
    }

    return await this.playlistRepository.updateById(id, updates);
  }

  async delete(account: Account, id: number): Promise<void> {
    const playlist = await this.playlistRepository.findById(id);
    ensureCanManagePlaylist(account, playlist);
    await this.playlistRepository.deleteById(id);
  }

  async addVideo(
    account: Account,
    playlistId: number,
    videoId: number,
  ): Promise<void> {
    const playlist = await this.playlistRepository.findById(playlistId);
    ensureCanManagePlaylist(account, playlist);

    const video = await this.videoRepository.findById(videoId);
    ensureCanManageVideo(account, video);

    await this.playlistRepository.addVideo(playlistId, videoId);
    await this.playlistRepository.updateById(playlistId, {
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  async removeVideo(
    account: Account,
    playlistId: number,
    videoId: number,
  ): Promise<void> {
    const playlist = await this.playlistRepository.findById(playlistId);
    ensureCanManagePlaylist(account, playlist);

    await this.playlistRepository.removeVideo(playlistId, videoId);
    await this.playlistRepository.updateById(playlistId, {
      lastUpdatedAt: new Date().toISOString(),
    });
  }
}
