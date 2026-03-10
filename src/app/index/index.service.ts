import fs from "node:fs";
import path from "node:path";
import { HttpStatusCode } from "../../utils/HttpStatusCode.js";

export type LocalVideoStreamResult =
  | {
      status: number;
      headers: Record<string, string | number>;
      stream: fs.ReadStream;
    }
  | {
      status: number;
      error: string;
    };

export async function getLocalVideoStream(
  filename: string,
  range?: string,
): Promise<LocalVideoStreamResult> {
  const videoPath = path.join("assets", "videos", filename);
  const stat = await fs.promises.stat(videoPath);
  const fileSize = stat.size;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parts[0] ? parseInt(parts[0], 10) : 0;
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return {
        status: HttpStatusCode.RANGE_NOT_SATISFIABLE,
        error: "Requested range not satisfiable",
      };
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(videoPath, { start, end });

    return {
      status: HttpStatusCode.PARTIAL_CONTENT,
      headers: {
        "Content-Range": `bytes ${start} - ${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      },
      stream,
    };
  }

  return {
    status: HttpStatusCode.OK,
    headers: {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    },
    stream: fs.createReadStream(videoPath),
  };
}
