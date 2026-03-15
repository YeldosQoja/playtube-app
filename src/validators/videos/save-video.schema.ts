import z from "zod";
import { createUpdateSchema } from "drizzle-zod";
import { videos } from "#db/schema/videos.sql.js";

const empty = z.object({});

const videoUpdateSchema = createUpdateSchema(videos, {
  thumbnailKey: z.string().nonempty(),
  category: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number.parseInt(val);
    }
    return val;
  }, z.number().int().positive().nullish()),
  isForKids: z.boolean(),
  isAgeRestricted: z.boolean(),
  allowComments: z.boolean(),
  allowDownloads: z.boolean(),
  privacy: z.enum(["public", "private", "unlisted"]),
});

const saveVideoBodySchema = videoUpdateSchema.extend({
  playlist: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number.parseInt(val);
    }
    return val;
  }, z.number().int().positive().nullish()),
  tags: z.string().min(1),
});

export const saveVideoSchema = z.object({
  body: saveVideoBodySchema,
  params: z.object({
    videoKey: z.string().min(1),
  }),
  query: empty,
});
