// haimtran 02 DEC 2022
// simple login form

import { Box, VStack, Button, Input, Text, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import { confirm } from "../services/cognito";

const ConfirmForm = () => {

  const [email, setEmail] = useState("") 
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
        <Text fontSize={30}>Create a new account</Text>
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
          placeholder="Password"
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
           confirm(email, code) 
          }}
       >
         Confirm 
        </Button>
      </VStack>
    </Box>
  );
};
export default ConfirmForm;
