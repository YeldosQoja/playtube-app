import type { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import type { Account } from "#core/account/account.repository.js";
import type { CommentRecord } from "#core/comment/comment.repository.js";
import type {
  UpdateVideoInput,
  VideoCategory,
  VideoDetailsRecord,
  VideoListRecord,
} from "./video.repository.js";

export interface SaveVideoInput {
  data: UpdateVideoInput;
  playlist?: number | null;
  tags?: string;
}

export interface VideoPlaybackDetails extends Omit<VideoDetailsRecord, "tags"> {
  tags: { id: number; name: string }[];
  cookies: CloudfrontSignedCookiesOutput;
  cookieDomain?: string;
  cookiePath: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface IVideoService {
  createDraft(account: Account, title: string): Promise<{ key: string }>;
  listUploaded(account: Account): Promise<(VideoListRecord & { thumbnailUrl: string | null })[]>;
  listCategories(): Promise<VideoCategory[]>;
  save(account: Account, videoKey: string, input: SaveVideoInput): Promise<void>;
  listComments(
    videoKey: string,
    limit: number,
    offset: number,
  ): Promise<CommentRecord[]>;
  delete(account: Account, videoKey: string): Promise<void>;
  getDetails(account: Account, videoKey: string): Promise<VideoPlaybackDetails>;
}
