import { VideoId, VideoKey } from "./value-objects.js";
import { Video } from "./video.js";

export interface IVideoRepository {
  nextId(): Promise<VideoId>;
  add(video: Video): Promise<void>;
  save(video: Video): Promise<void>;
  deleteByKey(key: VideoKey): Promise<void>;
  findById(id: VideoId): Promise<Video>;
  findByKey(key: VideoKey): Promise<Video>;
  list(): Promise<Video[]>;
}
