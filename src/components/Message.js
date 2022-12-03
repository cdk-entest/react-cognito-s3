import { Box, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import axios from "axios";
import { config } from "../config";

const fetchData = async (token) => {
  const { data, status } = await axios.get(config.API_URL_MESSAGE, {
    // crossdomain: true,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  console.log(data);
  console.log(status);
};

const Message = ({ user }) => {
  useEffect(() => {
    fetchData(user.IdToken);
  }, []);

  return (
    <Box>
      <Text>Hello Polly {user.IdToken}</Text>
    </Box>
  );
};

export default Message;
