import z from "zod";

const empty = z.object({}).optional();

export const getPlaylistSchema = z.object({
  body: empty,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: empty,
});
