import type { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";

export interface IVideoAssetService {
  getBaseUrl(): string;
  getCookieDomain(): string | undefined;
  generateSignedUrl(path: string, expirationDate: number | string | Date): Promise<string>;
  createSignedCookies(
    path: string,
    expirationDate: number | string | Date,
  ): Promise<CloudfrontSignedCookiesOutput>;
}
