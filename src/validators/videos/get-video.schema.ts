import z from "zod";

const empty = z.object({}).optional();

export const getVideoSchema = z.object({
  body: empty,
  params: z.object({
    videoKey: z.string().min(1),
  }),
  query: empty,
});
