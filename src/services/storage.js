import { config } from "../config";
import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const listObjects = async (idToken, prefix="public/") => {
  const s3Client = new S3Client({
    region: config.REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: config.REGION },
      identityPoolId: config.IDENTITY_POOL_ID,
      logins: {
        [config.COGNITO_POOL_ID]: idToken,
      },
    }),
  });

  const command = new ListObjectsCommand({
    Bucket: config.BUCKET,
    Prefix: prefix,
  });

  try {
    const result = await s3Client.send(command);
    // console.log("s3 list: ", result);
    // exclude the prefix itself 
    const allItems = result["Contents"]
    const items = allItems.filter(item => item.Key != prefix)
    return items;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getS3Object = async (idToken, key) => {
  const s3Client = new S3Client({
    region: config.REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: config.REGION },
      identityPoolId: config.IDENTITY_POOL_ID,
      logins: {
        [config.COGNITO_POOL_ID]: idToken,
      },
    }),
  });

  const command = new GetObjectCommand({
    Bucket: config.BUCKET,
    Key: key,
  });

  const signUrl = await getSignedUrl(s3Client, command);

  return signUrl;
};
