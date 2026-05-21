import z from "zod";

const empty = z.object({}).optional();

export const updateCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: empty,
});

type Schema = z.infer<typeof updateCommentSchema>;

export type UpdateCommentBody = Schema["body"];
export type UpdateCommentParams = Schema["params"];
