export type VideoAccessCredentials =
  | SignedUrlCredentials
  | SignedCookieCredentials
  | TokenCredentials;

export class SignedUrlCredentials {
  readonly type = "signed_url" as const;
  constructor(
    readonly url: string,
    readonly expiresAt: Date,
  ) {}
}

export class SignedCookieCredentials {
  readonly type = "signed_cookies" as const;
  constructor(
    readonly cookies: Record<string, string>,
    readonly expiresAt: Date,
  ) {}
}

export class TokenCredentials {
  readonly type = "token" as const;
  constructor(
    readonly url: string,
    readonly token: string,
    readonly expiresAt: Date,
  ) {}
}

export interface VideoAccessPort {
  authorize(path: string, duration?: number): Promise<VideoAccessCredentials>;
}
