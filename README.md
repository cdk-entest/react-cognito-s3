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
