import z from "zod";

const empty = z.object({}).optional();

export const createCommentSchema = z.object({
  body: z.object({
    videoId: z.number().int().positive(),
    text: z.string().min(1),
    parentId: z.number().int().positive().optional(),
  }),
  params: empty,
  query: empty,
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>["body"];
