import z from "zod";

const empty = z.object({}).optional();

export const listVideosSchema = z.object({
  body: empty,
  params: empty,
  query: empty,
});
