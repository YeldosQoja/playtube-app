import z from "zod";

const empty = z.object({});

export const listPlaylistsSchema = z.object({
  body: empty,
  params: empty,
  query: empty,
});
