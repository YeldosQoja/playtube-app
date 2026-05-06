export const UPLOAD_PART_SIZE_BYTES = 20_000_000;

export function thumbnailUploadPath(username: string, key: string) {
  return `uploads/${username}/thumbnails/${key}`;
}

export function videoUploadPath(username: string, key: string) {
  return `uploads/${username}/videos/${key}`;
}

export function videoOutputPath(username: string, key: string) {
  return `outputs/${username}/${key}`;
}
