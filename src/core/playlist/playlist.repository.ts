export interface PlaylistRecord {
  id: number;
  title: string;
  desc?: string | null;
  thumbnailStorageKey: string;
  author: number;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface PlaylistSummary {
  id: number;
  title: string;
  lastUpdatedAt: string;
  videoCount: number;
}

export interface PlaylistDetails extends PlaylistRecord {
  videosToPlaylists?: unknown[];
}

export interface CreatePlaylistInput {
  author: number;
  title: string;
  desc?: string | null;
  thumbnailStorageKey: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface UpdatePlaylistInput {
  title?: string;
  desc?: string | null;
  thumbnailStorageKey?: string;
  lastUpdatedAt?: string;
}

export interface IPlaylistRepository {
  create(data: CreatePlaylistInput): Promise<PlaylistRecord>;
  listByAuthor(authorId: number): Promise<PlaylistSummary[]>;
  findById(id: number): Promise<PlaylistDetails>;
  updateById(id: number, data: UpdatePlaylistInput): Promise<PlaylistRecord>;
  deleteById(id: number): Promise<void>;
  addVideo(playlistId: number, videoId: number): Promise<void>;
  removeVideo(playlistId: number, videoId: number): Promise<void>;
}
