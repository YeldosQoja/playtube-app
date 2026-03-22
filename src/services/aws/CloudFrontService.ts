import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { getAwsConfig } from "#config/aws.js";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import logger from "#lib/logger.js";

const secretsManagerClient = new SecretsManagerClient();

export class CloudFrontService {
  async generateSignedUrl(
    path: string,
    expirationDate: number | string | Date,
  ) {
    const {
      cloudFront: { baseUrl, keyGroupId, secretName },
    } = getAwsConfig();

    const output = await secretsManagerClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );

    logger.debug({
      url: `${baseUrl}/${path}`,
      secret: output.SecretString,
    });

    const url = getSignedUrl({
      url: `${baseUrl}/${path}`,
      keyPairId: keyGroupId,
      privateKey: output.SecretString!,
      dateLessThan: expirationDate,
    });

    return url;
  }
}
