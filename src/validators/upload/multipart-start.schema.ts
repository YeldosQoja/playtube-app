import z from "zod";

const empty = z.object({}).optional();

export const multipartStartSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    contentType: z.string().min(1),
    fileSize: z.coerce.number().int().positive(),
  }),
  params: empty,
  query: empty,
});
