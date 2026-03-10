import z from "zod";

const empty = z.object({});

export const updatePlaylistSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    desc: z.string().optional().nullable(),
    thumbnailStorageKey: z.string().min(1).optional(),
    thumbnailKey: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: empty,
});
