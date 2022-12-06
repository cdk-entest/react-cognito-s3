// haimtran 02 DEC 2022
// simple login form

import { Box, VStack, Button, Input, Text, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import { confirm, signIn } from "../services/cognito";

const ConfirmForm = ({ setUser, user }) => {
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [code, setCode] = useState("");

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
        <Text fontSize={30}>Please confirm your account</Text>
        <Spacer></Spacer>
        <Input
          padding={"20px"}
          margin={"20px"}
          placeholder="Email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        ></Input>
        <Input
          padding={"20px"}
          placeholder="Confirm Code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
          }}
        ></Input>
        <Spacer></Spacer>
        <Button
          marginTop={"20px"}
          minWidth={"100%"}
          colorScheme={"purple"}
          onClick={async () => {
            await confirm(email, code);
            // get auth state or login and set user to localstorage
            try {
              const response = await signIn(
                // localStorage.getItem("email"),
                // localStorage.getItem("pass")
                user.username,
                user.password
              );
              setUser({
                state: "AUTHENTICATED",
                IdToken: response["AuthenticationResult"]["IdToken"],
              });
              // setUser(user["AuthenticationResult"]["IdToken"]);
              localStorage.setItem(
                "user",
                JSON.stringify({
                  state: "AUTHENTICATED",
                  IdToken: response["AuthenticationResult"]["IdToken"],
                })
              );
            } catch (error) {
              setUser(null);
            }
          }}
        >
          Confirm
        </Button>
      </VStack>
    </Box>
  );
};
export default ConfirmForm;
