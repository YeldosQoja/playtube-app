import type { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import { getAwsConfig } from "#config/aws.js";
import type { IVideoAssetService } from "#core/video/video.asset-service.js";
import { CloudFrontService } from "#services/aws/CloudFrontService.js";

export class CloudFrontVideoAssetService implements IVideoAssetService {
  constructor(private readonly cloudFrontService: CloudFrontService) {}

  getBaseUrl(): string {
    return getAwsConfig().cloudFront.baseUrl;
  }

  getCookieDomain(): string | undefined {
    return getAwsConfig().cloudFront.domain;
  }

  async generateSignedUrl(
    path: string,
    expirationDate: number | string | Date,
  ): Promise<string> {
    return await this.cloudFrontService.generateSignedUrl(path, expirationDate);
  }

  async createSignedCookies(
    path: string,
    expirationDate: number | string | Date,
  ): Promise<CloudfrontSignedCookiesOutput> {
    return await this.cloudFrontService.createSignedCookies(
      path,
      expirationDate,
    );
  }
}
