import z from "zod";

const empty = z.object({});

export const signInSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
  params: empty,
  query: empty,
});
