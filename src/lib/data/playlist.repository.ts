import { eq, sql } from "drizzle-orm";
import { AccountId } from "#components/account/domain/value-objects.js";
import type { IPlaylistRepository } from "#components/playlist/domain/playlist.repository.js";
import {
  createPlaylist,
  type Playlist,
  type PlaylistSnapshot,
} from "#components/playlist/domain/playlist.js";
import {
  LastUpdatedAt,
  PlaylistDescription,
  PlaylistId,
  PlaylistThumbnailKey,
  PlaylistTitle,
} from "#components/playlist/domain/value-objects.js";
import { VideoId } from "#components/video/domain/value-objects.js";
import { db } from "#db/index.js";
import { playlists } from "#db/schema/playlists.sql.js";
import { videosToPlaylists } from "#db/schema/videosToPlaylists.sql.js";

type PlaylistRecord = typeof playlists.$inferSelect;
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class PlaylistRepository implements IPlaylistRepository {
  async nextId(): Promise<PlaylistId> {
    const { rows } = await db.execute(
      sql`SELECT nextval('playlist_id_seq') AS id`,
    );
    const row = rows[0];

    if (!row) {
      throw new Error("Playlist identity can't be generated.");
    }

    return new PlaylistId(Number(row["id"]));
  }

  async add(playlist: Playlist): Promise<void> {
    const snapshot = playlist.toSnapshot();
    const now = new Date().toISOString();

    await db.transaction(async (tx) => {
      await tx.insert(playlists).values({
        ...this.toPersistence(snapshot),
        createdAt: now,
      });

      await this.syncVideos(tx, snapshot.id, snapshot.videoIds);
    });
  }

  async save(playlist: Playlist): Promise<void> {
    const snapshot = playlist.toSnapshot();
    const persistence = this.toPersistence(snapshot);
    const { id, ...data } = persistence;

    await db.transaction(async (tx) => {
      const result = await tx
        .update(playlists)
        .set(data)
        .where(eq(playlists.id, id))
        .returning({ id: playlists.id });

      if (!result[0]) {
        throw new Error(`Playlist not found with id ${id}.`);
      }

      await this.syncVideos(tx, id, snapshot.videoIds);
    });
  }

  async delete(id: PlaylistId): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id.value));
  }

  async findById(id: PlaylistId): Promise<Playlist> {
    const rows = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id.value))
      .limit(1);
    const playlist = rows[0];

    if (!playlist) {
      throw new Error(`Playlist not found with id ${id.value}.`);
    }

    return await this.toDomain(playlist);
  }

  async findManyByAccountId(accountId: AccountId): Promise<Playlist[]> {
    const rows = await db
      .select()
      .from(playlists)
      .where(eq(playlists.author, accountId.value));

    return await Promise.all(rows.map((playlist) => this.toDomain(playlist)));
  }

  private toPersistence(snapshot: PlaylistSnapshot) {
    return {
      id: snapshot.id,
      author: snapshot.authorId,
      title: snapshot.title,
      desc: snapshot.description,
      thumbnailStorageKey: snapshot.thumbnailKey,
      lastUpdatedAt: snapshot.lastUpdatedAt,
    };
  }

  private async toDomain(playlist: PlaylistRecord): Promise<Playlist> {
    const links = await db
      .select({ id: videosToPlaylists.video })
      .from(videosToPlaylists)
      .where(eq(videosToPlaylists.playlist, playlist.id));

    return createPlaylist(
      new PlaylistId(playlist.id),
      new AccountId(playlist.author),
      new PlaylistTitle(playlist.title),
      playlist.desc ? new PlaylistDescription(playlist.desc) : null,
      new PlaylistThumbnailKey(playlist.thumbnailStorageKey),
      new LastUpdatedAt(playlist.lastUpdatedAt),
      links.map((link) => new VideoId(link.id)),
    );
  }

  private async syncVideos(
    tx: Transaction,
    id: number,
    videoIds: number[],
  ): Promise<void> {
    if (!videoIds.length) {
      return;
    }

    await tx
      .insert(videosToPlaylists)
      .values(
        videoIds.map((videoId) => ({
          playlist: id,
          video: videoId,
          addedAt: new Date().toISOString(),
        })),
      )
      .onConflictDoNothing();
  }
}
