import z from "zod";

const empty = z.object({});

const createPlaylistBodySchema = z
  .object({
    title: z.string().min(1),
    desc: z.string().optional().nullable(),
    thumbnailStorageKey: z.string().min(1).optional(),
    thumbnailKey: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.thumbnailStorageKey || data.thumbnailKey), {
    message: "Thumbnail key is required.",
  });

export const createPlaylistSchema = z.object({
  body: createPlaylistBodySchema,
  params: empty,
  query: empty,
});
