// haimtran 14 SEP 2022
// cognito auth => token => credential => s3 client

import { S3Client, ListObjectsCommand, GetObjectAclCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from 'axios'
import { config } from "./config.js";


// ======================================================
// cognito client
// ======================================================
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION,
});

// authenticate and get token
const response = await cognitoClient.send(
  new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: config.USERNAME,
      PASSWORD: config.PASSWORD,
    },
    ClientId: config.CLIENT_ID,
  })
);

// console.log(response)

// console.log("auth res ", response["AuthenticationResult"]["IdToken"]);

// ======================================================
// exchange token for credentials
// ======================================================
const credential = fromCognitoIdentityPool({
  cliengConfig: { region: config.REGION },
  identityPoolId: config.IDENTITY_POOL_ID,
  logins: {
    [config.COGNITO_POOL_ID]: response["AuthenticationResult"]["IdToken"],
  },
});

// const retrievs = await credential.call();
// console.log(retrievs);

// ======================================================
// s3 client with the token
// exchange token for credential: accessKeyId, secreteAccesKey, 
// sessionToken
// ======================================================
const s3Client = new S3Client({
  region: config.REGION,
  credentials: fromCognitoIdentityPool({
    cliengConfig: { region: config.REGION },
    identityPoolId: config.IDENTITY_POOL_ID,
    logins: {
      [config.COGNITO_POOL_ID]: response["AuthenticationResult"]["IdToken"],
    },
  }),
});

// send s3 list objects command
const command = new ListObjectsCommand({
  Bucket: config.BUCKET,
  Prefix: "public/",
});

// try {
//   const result = await s3Client.send(command);
//   // console.log(result["Contents"]);
//   const allItems = result["Contents"]
//   const items = allItems.filter(item => item.Key != "public/")
//   console.log(items)

// } catch (error) {
//   console.log(error);
// }


// ======================================================
// s3 client get pre-signed url 
// ======================================================
// try {
//   const signedUrl = await getSignedUrl(
//     s3Client, 
//     new GetObjectCommand({
//       Bucket: config.BUCKET,
//       Key: "image_1.png"
//     })
//   )
//   console.log(signedUrl)

// } catch (error) {
//   console("error get signed url, ", error)
// }

// ======================================================
// send request to apigw endpoint with token for auth header 
// ======================================================
const callApi = async () => {
  const { data, status } = await axios.get(config.API_URL_MESSAGE, {
    headers: {
      "Authorization": `Bearer ${response["AuthenticationResult"]["IdToken"]}`
    }
  })

  console.log(data)

  console.log(status)
}

callApi()

