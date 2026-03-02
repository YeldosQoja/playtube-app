import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { getAwsConfig } from "../../config/aws.js";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const secretsManagerClient = new SecretsManagerClient();

export class CloudFrontService {
  async generateSignedUrl(
    username: string,
    storageKey: string,
    expirationDate: number | string | Date
  ) {
    const {
      cloudFront: { baseUrl, keyGroupId, secretName },
    } = getAwsConfig();

    const output = await secretsManagerClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    const url = getSignedUrl({
      url: `${baseUrl}/outputs/${username}/${storageKey}/output.m3u8`,
      keyPairId: keyGroupId,
      privateKey: output.SecretString!,
      dateLessThan: expirationDate, // Video will be available for the next hour
    });

    return url;
  }
}
