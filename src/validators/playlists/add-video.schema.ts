import z from "zod";

const empty = z.object({}).optional();

export const addVideoToPlaylistSchema = z.object({
  body: empty,
  params: z.object({
    playlistId: z.coerce.number().int().positive(),
    videoId: z.coerce.number().int().positive(),
  }),
  query: empty,
});

export type AddVideoParams = z.infer<typeof addVideoToPlaylistSchema>["params"];
