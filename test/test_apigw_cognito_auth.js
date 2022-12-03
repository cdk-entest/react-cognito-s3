// haimtran 14 SEP 2022
// cognito auth => token => credential => s3 client

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from "axios";
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

console.log("auth res ", response["AuthenticationResult"]["IdToken"]);

// ======================================================
// send a post request to apigw endpoint with token for auth header
// ======================================================
const callApi = async () => {
  const { data, status } = await axios.post(
    config.API_URL_MESSAGE,
    { message: "hello" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${response["AuthenticationResult"]["IdToken"]}`,
      },
    }
  );
  console.log(data);
  console.log(status);
};

// callApi();

// ======================================================
// send a get request to apigw endpoint with token for auth header
// ======================================================
const fetchMessages = async () => {
  const { data, status } = await axios.get(config.API_URL_MESSAGE, {
    headers: {
      Authorization: `Bearer ${response["AuthenticationResult"]["IdToken"]}`,
    },
  });
  console.log(data);
  console.log(status);
};

// fetchMessages();

// 
const testRequest = async () => {
  const { data, status } = await axios.get(config.API_URL_TEST, {
    headers: {
      Authorization: `Bearer ${response["AuthenticationResult"]["IdToken"]}`
    }
  })
  console.log(data)
  console.log(status)
}


testRequest()
