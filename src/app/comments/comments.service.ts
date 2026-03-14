import { createComment, findVideoByKey, updateComment } from "#db/queries.js";

export async function createCommentForVideo(data: {
  authorId: number;
  videoPublicKey: string;
  text: string;
  parentId?: number | null;
}) {
  const video = await findVideoByKey(data.videoPublicKey);

  await createComment({
    author: data.authorId,
    video: video.id,
    content: data.text,
    parentComment: data.parentId,
  });
}

export async function updateCommentById(id: number, text: string) {
  await updateComment(id, text);
}
