import z from "zod";

const empty = z.object({}).optional();

export const listVideoCategoriesSchema = z.object({
  body: empty,
  params: empty,
  query: empty,
});
