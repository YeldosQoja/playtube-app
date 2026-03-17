import z from "zod";

const empty = z.object({}).optional();

export const simpleUploadSchema = z.object({
  body: z.object({
    contentType: z.string().min(1),
  }),
  params: empty,
  query: empty,
});
