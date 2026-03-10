import z from "zod";

const empty = z.object({});

const completedPartSchema = z.object({
  ETag: z.string().min(1),
  PartNumber: z.number().int().positive(),
});

export const multipartCompleteSchema = z.object({
  body: z.object({
    uploadId: z.string().min(1),
    key: z.string().min(1),
    contentType: z.string().min(1),
    parts: z.array(completedPartSchema).min(1),
  }),
  params: empty,
  query: empty,
});
