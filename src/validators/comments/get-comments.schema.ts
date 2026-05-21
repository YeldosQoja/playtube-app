import z from "zod";

export const getCommentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    videoId: z.number().int().positive(),
    parentCommentId: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive(),
    perPage: z.coerce.number().int().nonnegative().optional().default(0),
  }),
});

export type GetCommentsQuery = z.infer<typeof getCommentsSchema>["query"];
