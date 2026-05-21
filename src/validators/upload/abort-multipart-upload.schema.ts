import z from "zod";

const empty = z.object({}).optional();

export const abortMultipartUploadSchema = z.object({
  body: z.object({
    uploadSessionId: z.string().min(1),
    key: z.string().min(1),
  }),
  params: empty,
  query: empty,
});

export type AbortMultipartUploadBody = z.infer<
  typeof abortMultipartUploadSchema
>["body"];
