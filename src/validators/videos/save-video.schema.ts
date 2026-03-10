import z from "zod";
import { createUpdateSchema } from "drizzle-zod";
import { videos } from "../../db/schema/videos.sql.js";

const empty = z.object({});

const videoUpdateSchema = createUpdateSchema(videos, {
  thumbnailKey: z.string().nonempty(),
  category: z.number().int().positive(),
  isForKids: z.boolean(),
  isAgeRestricted: z.boolean(),
  allowComments: z.boolean(),
  allowDownloads: z.boolean(),
  privacy: z.enum(["public", "private", "unlisted"]),
});

const saveVideoBodySchema = videoUpdateSchema.extend({
  playlist: z.coerce.number().int().positive(),
  tags: z.string().min(1),
});

export const saveVideoSchema = z.object({
  body: saveVideoBodySchema,
  params: z.object({
    videoKey: z.string().min(1),
  }),
  query: empty,
});
