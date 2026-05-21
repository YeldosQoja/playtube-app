export class CommentId {
  constructor(public readonly value: number) {}
}

export class Content {
  constructor(public readonly value: string) {
    if (!value.trim().length) {
      throw new Error("Empty content can't be saved as comment");
    }
    this.value = value;
  }
}
