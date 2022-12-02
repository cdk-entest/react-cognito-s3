import {
  Box,
  VStack,
  Button,
  ChakraProvider,
  Input,
  Text,
  Spacer,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  createBrowserRouter, 
  RouterProvider,
} from "react-router-dom"




const LoginForm = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");

  return (
    <Box
      height={"100vh"}
      margin={"auto"}
      bg={"gray.200"}
      display={"flex"}
      alignContent={"center"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <VStack
        bg={"white"}
        padding={"30px"}
        spacing={"20px"}
        minHeight={"350px"}
      >
        <Text fontSize={30}>Sign in to your account</Text>
        <Spacer></Spacer>
        <Input
          padding={"20px"}
          margin={"20px"}
          placeholder="Email"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        ></Input>
        <Input
          padding={"20px"}
          placeholder="Password"
          value={pass}
          onChange={(event) => {
            setPass(event.target.value);
          }}
        ></Input>
        <Spacer></Spacer>
        <Button marginTop={"20px"} minWidth={"100%"} colorScheme={"purple"}>
          Sign In
        </Button>
        <HStack minW={"100%"} alignContent={"space-between"}>
          <Text>No account?</Text>
          <Button fontWeight={"light"} color={"blue"} bg={"white"}>
            Sign Up
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

const SessionPage = () => {
  return (
    <Box>
      <Text>
        Hello Hai Tran
      </Text>
    </Box>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginForm></LoginForm>
  },
  {
    path: "/session",
    element: <SessionPage></SessionPage>
  }
])

function App() {
  return (
    <ChakraProvider>
      <RouterProvider router={router}>
      </RouterProvider> 
    </ChakraProvider>
  );
}

export default App;
