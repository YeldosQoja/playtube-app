import { AccountId } from "#components/account/domain/value-objects.js";
import { Playlist } from "./playlist.js";
import { PlaylistId } from "./value-objects.js";

export interface IPlaylistRepository {
  nextId(): Promise<PlaylistId>;
  add(playlist: Playlist): Promise<void>;
  save(playlist: Playlist): Promise<void>;
  delete(id: PlaylistId): Promise<void>;
  findById(id: PlaylistId): Promise<Playlist>;
  findManyByAccountId(accountId: AccountId): Promise<Playlist[]>;
}
