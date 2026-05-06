import type { Account } from "#core/account/account.repository.js";
import type {
  PlaylistDetails,
  PlaylistRecord,
  PlaylistSummary,
  UpdatePlaylistInput,
} from "./playlist.repository.js";

export interface CreatePlaylistForAccountInput {
  title: string;
  desc?: string | null;
  thumbnailStorageKey?: string;
  thumbnailKey?: string;
}

export interface IPlaylistService {
  create(
    account: Account,
    data: CreatePlaylistForAccountInput,
  ): Promise<PlaylistRecord>;
  list(account: Account): Promise<PlaylistSummary[]>;
  get(account: Account, id: number): Promise<PlaylistDetails>;
  update(
    account: Account,
    id: number,
    data: UpdatePlaylistInput & { thumbnailKey?: string },
  ): Promise<PlaylistRecord>;
  delete(account: Account, id: number): Promise<void>;
  addVideo(account: Account, playlistId: number, videoId: number): Promise<void>;
  removeVideo(
    account: Account,
    playlistId: number,
    videoId: number,
  ): Promise<void>;
}
