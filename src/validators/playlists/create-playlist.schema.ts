import z from "zod";

const empty = z.object({}).optional();

const createPlaylistBodySchema = z
  .object({
    title: z.string().min(1),
    desc: z.string().optional(),
    thumbnailKey: z.string().min(1),
  })
  .refine((data) => Boolean(data.thumbnailKey), {
    message: "Thumbnail key is required.",
  });

export const createPlaylistSchema = z.object({
  body: createPlaylistBodySchema,
  params: empty,
  query: empty,
});

export type CreatePlaylistBody = z.infer<typeof createPlaylistSchema>["body"];
