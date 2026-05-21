import z from "zod";

const empty = z.object({}).optional();

export const createDraftSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    contentType: z.string().min(1),
    fileSize: z.coerce.number().int().positive(),
  }),
  query: empty,
  params: empty,
});

export type CreateDraftBody = z.infer<typeof createDraftSchema>["body"];
