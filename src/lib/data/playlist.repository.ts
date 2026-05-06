import { and, countDistinct, eq } from "drizzle-orm";
import { db } from "#db/index.js";
import { playlists } from "#db/schema/playlists.sql.js";
import { videosToPlaylists } from "#db/schema/videosToPlaylists.sql.js";
import type {
  CreatePlaylistInput,
  IPlaylistRepository,
  PlaylistDetails,
  PlaylistRecord,
  PlaylistSummary,
  UpdatePlaylistInput,
} from "#core/playlist/playlist.repository.js";

export class PlaylistRepository implements IPlaylistRepository {
  async create(data: CreatePlaylistInput): Promise<PlaylistRecord> {
    const result = await db.insert(playlists).values(data).returning();
    const playlist = result[0];

    if (!playlist) {
      throw new Error("Playlist could not be created.");
    }

    return playlist;
  }

  async listByAuthor(authorId: number): Promise<PlaylistSummary[]> {
    return await db
      .select({
        id: playlists.id,
        title: playlists.title,
        lastUpdatedAt: playlists.lastUpdatedAt,
        videoCount: countDistinct(videosToPlaylists.video),
      })
      .from(playlists)
      .leftJoin(videosToPlaylists, eq(playlists.id, videosToPlaylists.playlist))
      .where(eq(playlists.author, authorId))
      .groupBy(playlists.id)
      .orderBy(playlists.lastUpdatedAt);
  }

  async findById(id: number): Promise<PlaylistDetails> {
    const playlist = await db.query.playlists.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id),
      with: {
        videosToPlaylists: {
          with: {
            video: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new Error(`Playlist not found with id ${id}.`);
    }

    return playlist;
  }

  async updateById(
    id: number,
    data: UpdatePlaylistInput,
  ): Promise<PlaylistRecord> {
    const result = await db
      .update(playlists)
      .set(data)
      .where(eq(playlists.id, id))
      .returning();
    const playlist = result[0];

    if (!playlist) {
      throw new Error(`Playlist not found with id ${id}.`);
    }

    return playlist;
  }

  async deleteById(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async addVideo(playlistId: number, videoId: number): Promise<void> {
    await db
      .insert(videosToPlaylists)
      .values({
        playlist: playlistId,
        video: videoId,
        addedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  }

  async removeVideo(playlistId: number, videoId: number): Promise<void> {
    await db
      .delete(videosToPlaylists)
      .where(
        and(
          eq(videosToPlaylists.playlist, playlistId),
          eq(videosToPlaylists.video, videoId),
        ),
      );
  }
}
