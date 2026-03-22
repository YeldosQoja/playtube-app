import { nanoid } from "nanoid";
import { CloudFrontService } from "#services/aws/CloudFrontService.js";
import {
  createVideoDraft,
  deleteVideo,
  findVideoByKey,
  getCommentsByVideoId,
  getUploadedVideos,
  getVideoCategories,
  updateVideo,
} from "#db/queries.js";
import { videos } from "#db/schema/videos.sql.js";
import logger from "#lib/logger.js";

const cloudFrontService = new CloudFrontService();

export type VideoUpdateInput = typeof videos.$inferInsert;

export async function createDraft(authorId: number, title: string) {
  const videoKey = nanoid();

  await createVideoDraft({
    author: authorId,
    key: videoKey,
    title,
    privacy: "private",
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });

  return { key: videoKey };
}

export async function listUploadedVideos(username: string) {
  const res = await getUploadedVideos();
  const videos = await Promise.all(
    res.map(async (data) => {
      const { thumbnailKey, ...rest } = data;
      const thumbnailPath = `uploads/${username}/thumbnails/${thumbnailKey}`;
      const thumbnailUrl = await cloudFrontService.generateSignedUrl(
        thumbnailPath,
        Date.now() + 3600,
      );
      return { thumbnailUrl, ...rest };
    }),
  );
  return videos;
}

export async function listVideoCategories() {
  return await getVideoCategories();
}

export async function saveVideo(
  videoKey: string,
  data: Record<string, unknown>,
  playlist: number,
  tags: string,
) {
  const tagNames = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  await updateVideo(videoKey, data as VideoUpdateInput, playlist, tagNames);
}

export async function getVideoComments(
  videoKey: string,
  limit: number,
  offset: number,
) {
  const video = await findVideoByKey(videoKey);
  return await getCommentsByVideoId(video.id, limit, offset);
}

export async function getVideoByKey(videoKey: string) {
  return await findVideoByKey(videoKey);
}

export async function deleteVideoByKey(videoKey: string) {
  await deleteVideo(videoKey);
}

export async function getVideoDetails(username: string, videoKey: string) {
  const video = await findVideoByKey(videoKey);
  const { key, thumbnailKey, tags, ...rest } = video;

  const playlistPath = `outputs/${username}/${key}/output.m3u8`;
  const thumbnailPath = `uploads/${username}/thumbnails/${key}`;

  const videoUrlPromise = cloudFrontService.generateSignedUrl(
    playlistPath,
    Date.now() + 3600,
  );
  const thumbnailUrlPromise = cloudFrontService.generateSignedUrl(
    thumbnailPath,
    Date.now() + 3600,
  );

  const [videoUrl, thumbnailUrl] = await Promise.all([
    videoUrlPromise,
    thumbnailUrlPromise,
  ]);

  logger.info(
    { videoUrl, thumbnailUrl },
    "Video and thumbnail urls generated.",
  );

  const data: Omit<typeof video, "tags" | "key" | "thumbnailKey"> & {
    tags: { id: number; name: string }[];
    videoUrl: string;
    thumbnailUrl: string;
  } = {
    ...rest,
    videoUrl,
    thumbnailUrl,
    tags: tags.map(({ tag }) => tag),
  };

  return data;
}
