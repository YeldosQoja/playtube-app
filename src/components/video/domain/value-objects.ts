export class VideoId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Video id must be a positive integer.");
    }
  }

  toNumber(): number {
    return this.value;
  }

  isEqual(videoId: VideoId): boolean {
    return this.value === videoId.toNumber();
  }
}

export class VideoKey {
  constructor(public readonly value: string) {
    if (!value.trim().length) {
      throw new Error("Video key can't be empty.");
    }

    if (value.length > 60) {
      throw new Error("Video key can't be longer than 60 characters.");
    }

    this.value = value;
  }
}

export class ThumbnailKey {
  constructor(public readonly value: string) {
    if (!value.trim().length) {
      throw new Error("Thumbnail key can't be empty.");
    }

    if (value.length > 60) {
      throw new Error("Thumbnail key can't be longer than 60 characters.");
    }

    this.value = value;
  }
}

export class VideoTitle {
  constructor(public readonly value: string) {
    const title = value.trim();

    if (!title.length) {
      throw new Error("Video title can't be empty.");
    }

    if (title.length > 60) {
      throw new Error("Video title can't be longer than 60 characters.");
    }

    this.value = title;
  }
}

export class VideoDescription {
  constructor(public readonly value: string) {
    const description = value.trim();

    if (!description.length) {
      throw new Error("Video description can't be empty.");
    }

    this.value = description;
  }
}

export class VideoCategoryId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Video category id must be a positive integer.");
    }
  }
}

export type PublicationStatusValue = "draft" | "published" | "deleted";

const publicationStatus = ["draft", "published", "deleted"] as const;

export class VideoPublicationStatus {
  constructor(public readonly value: PublicationStatusValue) {
    if (!publicationStatus.includes(value)) {
      throw new Error(`Unsupported video privacy: ${value}.`);
    }
  }

  isPublished() {
    return this.value === "published";
  }
}

export type VideoPrivacyValue = "public" | "private" | "unlisted";

const videoPrivacyValues = ["public", "private", "unlisted"] as const;

export class VideoPrivacy {
  constructor(public readonly value: VideoPrivacyValue) {
    if (!videoPrivacyValues.includes(value)) {
      throw new Error(`Unsupported video privacy: ${value}.`);
    }
  }
}

export type ProcessingStatusValue =
  | "PENDING_UPLOAD"
  | "PROCESSING"
  | "READY"
  | "FAILED";

const processingStatusValues = [
  "PENDING_UPLOAD",
  "PROCESSING",
  "READY",
  "FAILED",
] as const;

export class VideoProcessingStatus {
  constructor(public readonly value: ProcessingStatusValue) {
    if (!processingStatusValues.includes(value)) {
      throw new Error(`Unsupported video status: ${value}.`);
    }
  }

  isReady() {
    return this.value === "READY";
  }
}

export class VideoAudience {
  constructor(
    public readonly isForKids: boolean,
    public readonly isAgeRestricted: boolean,
  ) {
    if (isForKids && isAgeRestricted) {
      throw new Error("Video can't be both made for kids and age restricted.");
    }
  }
}

export class VideoPermissions {
  constructor(
    public readonly allowComments: boolean,
    public readonly allowDownloads: boolean,
  ) {}

  canComment(): boolean {
    return this.allowComments;
  }

  canDownload(): boolean {
    return this.allowDownloads;
  }
}

export class VideoTag {
  constructor(public readonly value: string) {
    const tag = value.trim();

    if (!tag.length) {
      throw new Error("Video tag can't be empty.");
    }

    this.value = tag;
  }
}
