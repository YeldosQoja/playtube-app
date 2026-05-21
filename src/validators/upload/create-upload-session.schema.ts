import z from "zod";

const empty = z.object({}).optional();

export const createUploadSessionSchema = z.object({
  body: z.object({
    contentType: z.string().min(1),
  }),
  params: empty,
  query: empty,
});

export type CreateUploadSessionBody = z.infer<
  typeof createUploadSessionSchema
>["body"];
