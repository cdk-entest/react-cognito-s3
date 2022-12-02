// haimtran 02 DEC 2022
// simple login form

import { Box, VStack, Button, Input, Text, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import { signUp } from "../services/cognito";

const SignupForm = ({ setUser }) => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [submit, setSubmit] = useState(false)

  const signUpNewAccount = async (username, password) => {
    console.log("sign up ...", username, password)
    if (!username) {
      setUser(null)
    } else {
      try {
        const user = await signUp(username, password)
        console.log(user)
        setSubmit(true)
        setUser("CONFIRM")
      } catch (error) {
        console.log(error)
        setUser(null)
      }
    }
  }

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
        minWidth={"350px"}
      >
        <Text fontSize={30}>Create a new account</Text>
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
        <Button
          marginTop={"20px"}
          minWidth={"100%"}
          colorScheme={"purple"}
          onClick={async () => {
            localStorage.setItem("email", name)
            localStorage.setItem("pass", pass)
            signUpNewAccount(name, pass)
          }}
        >
          Sign Up
        </Button>
      </VStack>
    </Box>
  );
};

export default SignupForm;
