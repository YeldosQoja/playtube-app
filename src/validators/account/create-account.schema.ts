import z from "zod";

const empty = z.object({}).optional();

export const createAccountSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    username: z.string().min(1),
    email: z.string().email().optional(),
  }),
  params: empty,
  query: empty,
});
