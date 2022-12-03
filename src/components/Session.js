import { Box, Button, Text } from "@chakra-ui/react";

const SessionPage = ({ user }) => {
  return (
    <Box>
      <Text>State: {user.state}</Text>
      <Text>AccessToken: {user.AccessToken}</Text>
      <Button
        colorScheme={"orange"}
        minWidth={"300px"}
        padding={"20px"}
        onClick={async () => {
          localStorage.clear();
          window.location.reload()
        }}
      >
        Sign Out
      </Button>
    </Box>
  );
};

export default SessionPage;
