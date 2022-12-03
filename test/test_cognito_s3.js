// haimtran 14 SEP 2022 
// cognito auth => token => credential => s3 client 

import {S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";
import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";
import { CognitoIdentityProviderClient,
  InitiateAuthCommand} 
from "@aws-sdk/client-cognito-identity-provider";
import { config } from './config.js'

// cognito client 
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION
})

// authenticate and get token 
const response = await cognitoClient.send(
  new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH", 
    AuthParameters: {
      "USERNAME": config.USERNAME,
      "PASSWORD": config.PASSWORD 
    },
    ClientId: config.CLIENT_ID,
  })
)

// console.log('auth res ', response['AuthenticationResult']['IdToken'])
// s3 client with the token 
// exchange token for credential
const s3Client = new S3Client({
  region: config.REGION, 
  credentials: fromCognitoIdentityPool({
    cliengConfig: {region: config.REGION}, 
    identityPoolId: config.IDENTITY_POOL_ID,
    logins: {
      [config.COGNITO_POOL_ID]:response['AuthenticationResult']['IdToken'] 
    }
  })
})

// send s3 list objects command 
const command = new ListObjectsCommand({
  Bucket: config.BUCKET,
  Prefix: 'public/'
}) 

try {
  const result = await s3Client.send(command)
  console.log(result['Contents'])

} catch(error){
  console.log(error)
}

const credential = fromCognitoIdentityPool({
    cliengConfig: {region: config.REGION}, 
    identityPoolId: config.IDENTITY_POOL_ID,
    logins: {
      [config.COGNITO_POOL_ID]:response['AuthenticationResult']['IdToken'] 
    }
  })

const retrievs = await credential.call()
console.log(retrievs)

