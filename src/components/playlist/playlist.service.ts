import { IAccountRepository } from "#components/account/domain/account.repository.js";
import {
  AccountId,
  AuthUserId,
} from "#components/account/domain/value-objects.js";
import { createPlaylist } from "./domain/playlist.js";
import {
  LastUpdatedAt,
  PlaylistDescription,
  PlaylistId,
  PlaylistThumbnailKey,
  PlaylistTitle,
} from "./domain/value-objects.js";
import { IPlaylistRepository } from "./domain/playlist.repository.js";
import { IVideoRepository } from "#components/video/domain/video.repository.js";
import { VideoId } from "#components/video/domain/value-objects.js";

export interface GetPlaylistDetailDTO {
  id: number;
  title: string;
  desc?: string | null;
  thumbnailKey: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ListPlaylistItemDTO {
  id: number;
  title: string;
  lastUpdatedAt: string;
  videoCount: number;
}

export interface UpdatePlaylistInputDTO {
  userId: string;
  playlistId: number;
  title?: string;
  desc?: string;
  thumbnailKey?: string;
}

export interface CreatePlaylistInputDTO {
  authUserId: string;
  title: string;
  desc?: string;
  thumbnailKey: string;
}

export interface AddVideoInputDTO {
  playlistId: number;
  videoId: number;
}

export interface RemoveVideoInputDTO {
  videoId: number;
  playlistId: number;
}

export class PlaylistService {
  constructor(
    private playlistRepository: IPlaylistRepository,
    private videoRepository: IVideoRepository,
    private accountRepository: IAccountRepository,
  ) {}

  async create(input: CreatePlaylistInputDTO): Promise<void> {
    const { authUserId, title, desc, thumbnailKey } = input;
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(authUserId),
    );

    const id = await this.playlistRepository.nextId();
    const playlist = createPlaylist(
      id,
      account.getId(),
      new PlaylistTitle(title),
      desc ? new PlaylistDescription(desc) : null,
      new PlaylistThumbnailKey(thumbnailKey),
      new LastUpdatedAt(),
    );

    await this.playlistRepository.add(playlist);
  }

  async list(authUserId: string): Promise<ListPlaylistItemDTO[]> {
    const account = await this.accountRepository.findByUserId(
      new AuthUserId(authUserId),
    );
    const playlists = await this.playlistRepository.findManyByAccountId(
      account.getId(),
    );

    return playlists.map((p) => ({
      id: p.getId().value,
      title: p.getTitle().value,
      lastUpdatedAt: p.getLastUpdatedAt().value,
      videoCount: p.getVideoCount(),
    }));
  }

  async get(id: number): Promise<GetPlaylistDetailDTO> {
    const playlist = await this.playlistRepository.findById(new PlaylistId(id));
    return {
      id: playlist.getId().value,
      title: playlist.getTitle().value,
      desc: playlist.getDesc()?.value ?? null,
      thumbnailKey: playlist.getThumbnailKey().value,
      lastUpdatedAt: playlist.getLastUpdatedAt().value,
      createdAt: "",
    };
  }

  async update(input: UpdatePlaylistInputDTO): Promise<void> {
    const { userId, playlistId, title, desc, thumbnailKey } = input;

    const account = await this.accountRepository.findByUserId(
      new AuthUserId(userId),
    );
    const playlist = await this.playlistRepository.findById(
      new PlaylistId(playlistId),
    );

    if (!playlist.isOwnedBy(account.getId())) {
      throw new Error("");
    }

    if (title) {
      playlist.updateTitle(new PlaylistTitle(title));
    }

    if (desc) {
      playlist.updateDescription(new PlaylistDescription(desc));
    }

    if (thumbnailKey) {
      playlist.updateThumbnail(new PlaylistThumbnailKey(thumbnailKey));
    }

    await this.playlistRepository.save(playlist);
  }

  async delete(id: number): Promise<void> {
    await this.playlistRepository.delete(new PlaylistId(id));
  }

  async addVideo(input: AddVideoInputDTO): Promise<void> {
    const { playlistId, videoId } = input;

    const playlist = await this.playlistRepository.findById(
      new PlaylistId(playlistId),
    );
    const video = await this.videoRepository.findById(new VideoId(videoId));
    playlist.addVideo(video.getId());

    await this.playlistRepository.save(playlist);
  }

  async removeVideo(input: RemoveVideoInputDTO): Promise<void> {
    const { playlistId, videoId } = input;

    const playlist = await this.playlistRepository.findById(
      new PlaylistId(playlistId),
    );
    const video = await this.videoRepository.findById(new VideoId(videoId));
    playlist.removeVideo(video.getId());

    await this.playlistRepository.save(playlist);
  }
}
