import z from "zod";
import { createUpdateSchema } from "drizzle-zod";
import { videos } from "#db/schema/videos.sql.js";

const empty = z.object({}).optional();

const videoUpdateSchema = createUpdateSchema(videos, {
  title: z.string().min(9),
  desc: z.string(),
  thumbnailKey: z.string().nonempty(),
  category: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number.parseInt(val);
    }
    return val;
  }, z.number().int().positive()),
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
  }, z.number().int().positive().optional()),
  tags: z.string().min(1),
});

export const saveVideoSchema = z.object({
  body: saveVideoBodySchema,
  params: z.object({
    videoKey: z.string().min(1),
  }),
  query: empty,
});

export type SaveVideoMetadataBody = z.infer<typeof saveVideoSchema>["body"];
