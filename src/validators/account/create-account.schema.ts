import z from "zod";

const empty = z.object({}).optional();

export const createAccountSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    username: z.string().min(1),
    email: z.string().email().optional(),
    birthday: z.date(),
  }),
  params: empty,
  query: empty,
});

export type CreateAccountBody = z.infer<typeof createAccountSchema>["body"];
