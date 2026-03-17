import z from "zod";

const empty = z.object({}).optional();

export const signUpSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    username: z.string().min(1),
    email: z.string().email().optional(),
    password: z.string().min(1),
  }),
  params: empty,
  query: empty,
});
