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

![Untitled Diagram drawio](https://user-images.githubusercontent.com/20411077/205415330-de02051c-9cc0-433d-bc47-72ca90255b78.png)

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

get image pre-signed url

```js
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
```

## FrontEnd List of Images

useEffect to load a list of images or objects

```js
const [images, setImages] = useState([]);
const [imageUrl, setImageUrl] = useState(null);

const getImages = async () => {
  const items = await listObjects(user.IdToken);
  if (items) {
    const keys = items.map((item) => item["Key"]);
    setImages(keys);
  }
};

useEffect(() => {
  getImages();
}, []);
```

display a list of images

```js
const ListImages = ({ user, images, setImageUrl }) => {
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      // height={"300px"}
      overflowY={"auto"}
      marginTop={"20px"}
      bg={"orange.100"}
    >
      {images.map((image, id) => (
        <Flex
          key={id}
          width={"100%"}
          justifyContent={"space-between"}
          alignItems={"center"}
          padding={"5px"}
          backgroundColor={"gray.100"}
          marginBottom={"5px"}
        >
          <Text>{image}</Text>
          <Button
            colorScheme={"teal"}
            onClick={async () => {
              const url = await getS3Object(user.IdToken, image);
              setImageUrl(url);
            }}
          >
            Download
          </Button>
        </Flex>
      ))}
    </Flex>
  );
};
```

load and view an image given the pre-singed url

```js
const ViewImage = ({ imageUrl }) => {
  return (
    <Box
      bg={"gray.100"}
      width={"1000px"}
      height={"500px"}
      padding={"20px"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      marginBottom={"20px"}
    >
      {imageUrl && <Image src={imageUrl} width="auto" height={"350px"}></Image>}
    </Box>
  );
};
```

## Troubleshooting

1. the configuration and COGNITO_POOL_ID should look like

```js
"COGNITO_POOL_ID": "cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xxx"
```

and the config.js

```js
export const config = {
  USERNAME: "xxx@xxx.io",
  PASSWORD: "xxx",
  COGNITO_POOL_ID:
    "cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xxx",
  IDENTITY_POOL_ID: "ap-southeast-1:xxx",
  CLIENT_ID: "xxx",
  REGION: "ap-southeast-1",
  BUCKET: "xxx",
};
```

2. please ensure deploying the api after changes

3. enable api gateway cords [out-of-the-box](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html)

4. search [cors](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway-readme.html#cross-origin-resource-sharing-cors) in cdk
