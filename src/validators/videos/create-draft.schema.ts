import z from "zod";

const empty = z.object({});

export const createDraftSchema = z.object({
  body: z.object({
    title: z.string().min(1),
  }),
  query: empty,
  params: empty,
});
