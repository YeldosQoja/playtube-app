import z from "zod";

const empty = z.object({}).optional();

const completedPartSchema = z.object({
  ETag: z.string().min(1),
  partNumber: z.number().int().positive(),
});

export const completeMultipartUploadSchema = z.object({
  body: z.object({
    uploadSessionId: z.string().min(1),
    key: z.string().min(1),
    parts: z.array(completedPartSchema).min(1),
  }),
  params: empty,
  query: empty,
});

export type CompleteMultipartUploadBody = z.infer<
  typeof completeMultipartUploadSchema
>["body"];
