export class PlaylistId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Playlist id must be a positive integer.");
    }
  }

  toNumber(): number {
    return this.value;
  }

  isEqual(playlistId: PlaylistId): boolean {
    return this.value === playlistId.toNumber();
  }
}

export class PlaylistTitle {
  constructor(public readonly value: string) {
    const title = value.trim();

    if (!title.length) {
      throw new Error("Playlist title can't be empty.");
    }

    if (title.length > 60) {
      throw new Error("Playlist title can't be longer than 60 characters.");
    }

    this.value = title;
  }

  toString(): string {
    return this.value;
  }
}

export class PlaylistDescription {
  constructor(public readonly value: string) {
    const description = value.trim();

    if (!description.length) {
      throw new Error("Playlist description can't be empty.");
    }

    if (description.length > 180) {
      throw new Error(
        "Playlist description can't be longer than 180 characters.",
      );
    }

    this.value = description;
  }

  toString(): string {
    return this.value;
  }
}

export class PlaylistThumbnailKey {
  constructor(public readonly value: string) {
    const thumbnailKey = value.trim();

    if (!thumbnailKey.length) {
      throw new Error("Playlist thumbnail key can't be empty.");
    }

    if (thumbnailKey.length > 60) {
      throw new Error(
        "Playlist thumbnail key can't be longer than 60 characters.",
      );
    }

    this.value = thumbnailKey;
  }

  toString(): string {
    return this.value;
  }
}

export class LastUpdatedAt {
  public readonly value: string;

  constructor(value: Date | string = new Date()) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Playlist last updated date is invalid.");
    }

    this.value = date.toISOString();
  }

  toString(): string {
    return this.value;
  }
}
