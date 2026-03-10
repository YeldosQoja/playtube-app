import z from "zod";

const empty = z.object({});

export const removeVideoFromPlaylistSchema = z.object({
  body: empty,
  params: z.object({
    playlistId: z.coerce.number().int().positive(),
    videoId: z.coerce.number().int().positive(),
  }),
  query: empty,
});
