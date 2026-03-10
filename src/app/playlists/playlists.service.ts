import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  findPlaylistById,
  findVideoById,
  getPlaylistsByAuthor,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../../db/queries.js";

export async function createPlaylistForUser(
  authorId: number,
  data: {
    title: string;
    desc?: string | null;
    thumbnailStorageKey?: string;
    thumbnailKey?: string;
  },
) {
  const thumbnail = data.thumbnailStorageKey || data.thumbnailKey;

  return await createPlaylist({
    author: authorId,
    title: data.title,
    desc: data.desc,
    thumbnailStorageKey: thumbnail!,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });
}

export async function listPlaylistsForUser(authorId: number) {
  return await getPlaylistsByAuthor(authorId);
}

export async function getPlaylistById(id: number) {
  return await findPlaylistById(id);
}

export async function updatePlaylistById(
  id: number,
  updates: Partial<{
    title: string;
    desc: string | null;
    thumbnailStorageKey: string;
    lastUpdatedAt: string;
  }>,
) {
  return await updatePlaylist(id, updates);
}

export async function deletePlaylistById(id: number) {
  await deletePlaylist(id);
}

export async function getVideoById(id: number) {
  return await findVideoById(id);
}

export async function addVideo(playlistId: number, videoId: number) {
  await addVideoToPlaylist(videoId, playlistId);
  await updatePlaylist(playlistId, {
    lastUpdatedAt: new Date().toISOString(),
  });
}

export async function removeVideo(playlistId: number, videoId: number) {
  await removeVideoFromPlaylist(videoId, playlistId);
  await updatePlaylist(playlistId, {
    lastUpdatedAt: new Date().toISOString(),
  });
}
