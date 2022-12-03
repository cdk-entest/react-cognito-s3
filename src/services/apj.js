// haimtran 14 SEP 2022
// cognito auth => token => credential => s3 client

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from "axios";
import { config } from "../config";

// ======================================================
// send a post request to apigw endpoint with token for auth header
// ======================================================
export const writeMessages = async (IdToken) => {
  const { data, status } = await axios.post(
    config.API_URL_MESSAGE,
    { message: "hello" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${IdToken}`,
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
export const fetchMessages = async (IdToken) => {
  try {
    const { data, status } = await axios.get(config.API_URL_MESSAGE, {
      headers: {
        Authorization: `Bearer ${IdToken}`,
      },
    });
    console.log(data);
    console.log(status);
    return data.Items 
  } catch (error) {
    console.log(error);
    return []
  }
};

// fetchMessages();
