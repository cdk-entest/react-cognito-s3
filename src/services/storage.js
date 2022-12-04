import { config } from "../config";
import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";

export const listObjects = async (idToken, prefix = "public/") => {
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
    const allItems = result["Contents"];
    const items = allItems.filter((item) => item.Key != prefix);
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

export const uploadToS3 = async (idToken, file) => {
  console.log("upload to s3 ", idToken);

  // s3 client
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

  // console.log(s3Client)

  // command to upload to s3
  const command = new PutObjectCommand({
    Bucket: config.BUCKET,
    Key: `public/${file.name}`,
    Body: file,
  });

  // upload file to s3
  try {
    const res = await s3Client.send(command);
    console.log(res);
  } catch (error) {
    console.log("erorr upload to s3 ", error);
  }
};

export const uploadToS3Progress = async (idToken, file, setProgress) => {
  // s3 client
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

  const upload = new Upload({
    client: s3Client, 
    params: {
      Bucket: config.BUCKET,
      Key: `public/${file.name}`, 
      Body: file,
    }
  })

  upload.on("httpUploadProgress", (progress) => {
    console.log(progress.loaded)
    console.log(progress.total)
    setProgress(progress.loaded / progress.total * 100.0)
  })

  await upload.done()


};
