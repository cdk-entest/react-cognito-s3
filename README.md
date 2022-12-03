---
author: haimtran
title: aws amplify demo using react js
description: aws amplify demo using react js
publishedDate: 02/12/2022
---

## Introduction

- create a react app
- use cognito to create account, confirm, sign in
- auth session and s3 access

## Architecture

## Create a React App

create a react app

```bash
npx create-react-app my-app
```

install dependencies

```bash
npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion react-icons @chakra-ui/icons react-router-dom
```

install aws sdk client (s3)

```bash
npm i @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-sdk/credential-providers @aws-sdk/s3-request-presigner
```

then run the app

```bash
npm start
```

## Basic Router

```js
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginForm></LoginForm>,
  },
  {
    path: "/session",
    element: <SessionPage></SessionPage>,
  },
]);

function App() {
  return (
    <ChakraProvider>
      <RouterProvider router={router}></RouterProvider>
    </ChakraProvider>
  );
}

export default App;
```

## Cognito Client

This is a js script to test how Cognito works.

create a cognito client

```js
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION,
});
```

authenticate and get token

```js
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
```

exchange token for aws credentials to access s3, this done via s3Client

```js
const credential = fromCognitoIdentityPool({
  cliengConfig: { region: config.REGION },
  identityPoolId: config.IDENTITY_POOL_ID,
  logins: {
    [config.COGNITO_POOL_ID]: response["AuthenticationResult"]["IdToken"],
  },
});

const retrievs = await credential.call();
console.log(retrievs);
```

given the credentials, we can access S3 data

```js
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

try {
  const result = await s3Client.send(command);
  console.log(result["Contents"]);
} catch (error) {
  console.log(error);
}
```
