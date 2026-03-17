import z from "zod";

export const getVideoCommentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    videoKey: z.string().min(1),
  }),
  query: z.object({
    limit: z.coerce.number().int().positive(),
    offset: z.coerce.number().int().nonnegative().optional().default(0),
  }),
});
