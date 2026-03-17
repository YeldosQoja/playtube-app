import z from "zod";

const empty = z.object({}).optional();

export const createCommentSchema = z.object({
  body: z.object({
    videoPublicKey: z.string().min(1),
    text: z.string().min(1),
    parentId: z.number().int().positive().optional().nullable(),
  }),
  params: empty,
  query: empty,
});
