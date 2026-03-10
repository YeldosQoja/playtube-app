import z from "zod";

const empty = z.object({});

export const multipartAbortSchema = z.object({
  body: z.object({
    uploadId: z.string().min(1),
    key: z.string().min(1),
  }),
  params: empty,
  query: empty,
});
