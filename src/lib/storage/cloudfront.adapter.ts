import {
  SignedCookieCredentials,
  SignedUrlCredentials,
  type VideoAccessCredentials,
  type VideoAccessPort,
} from "#components/video/ports/video-access.port.js";
import { getAwsConfig } from "#config/aws.js";
import {
  getSignedCookies,
  getSignedUrl,
  type CloudfrontSignedCookiesOutput,
} from "@aws-sdk/cloudfront-signer";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const DEFAULT_ACCESS_DURATION_SECONDS = 3_600;

export class CloudFrontAdapter implements VideoAccessPort {
  constructor(private readonly secretsManager: SecretsManagerClient) {}

  getBaseUrl(): string {
    return getAwsConfig().cloudFront.baseUrl;
  }

  getCookieDomain(): string | undefined {
    return getAwsConfig().cloudFront.domain;
  }

  async authorize(
    path: string,
    duration = DEFAULT_ACCESS_DURATION_SECONDS,
  ): Promise<VideoAccessCredentials> {
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Video access duration must be a positive number.");
    }

    const {
      cloudFront: { baseUrl, keyGroupId, secretName },
    } = getAwsConfig();

    const output = await this.secretsManager.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );

    const expiresAt = new Date(Date.now() + duration * 1000);

    if (!path.includes("*")) {
      const url = getSignedUrl({
        url: `${baseUrl}/${path}`,
        keyPairId: keyGroupId,
        privateKey: output.SecretString!,
        dateLessThan: expiresAt,
      });

      return new SignedUrlCredentials(url, expiresAt);
    }

    const signedCookies = getSignedCookies({
      url: `${baseUrl}/${path}`,
      keyPairId: keyGroupId,
      privateKey: Buffer.from(output.SecretString!),
      dateLessThan: expiresAt,
    });
    const cookies: Record<string, string> = {};

    for (const name of Object.keys(signedCookies)) {
      const value = signedCookies[name as keyof CloudfrontSignedCookiesOutput];

      if (value !== undefined) {
        cookies[name] = String(value);
      }
    }

    return new SignedCookieCredentials(cookies, expiresAt);
  }
}
