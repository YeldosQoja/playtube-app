import type { RequestHandler } from "express";
import { getLocalVideoStream } from "./index.service.js";

export const getHomeHandler: RequestHandler = (req, res) => {
  res.send("Hello World!");
};

export const getLocalVideoHandler: RequestHandler = async (req, res) => {
  const { filename } = req.params;
  const range = req.headers.range;

  const result = await getLocalVideoStream(filename, range);

  if ("error" in result) {
    res.status(result.status).send(result.error);
    return;
  }

  res.writeHead(result.status, result.headers);
  result.stream.pipe(res);
};
