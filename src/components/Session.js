import {
  Box,
  Text,
} from "@chakra-ui/react";

const SessionPage = ({ user }) => {
  return (
    <Box>
      <Text>
       AccessToken: {user["AuthenticationResult"]["AccessToken"]} 
      </Text>
      <Text>
        IdToken: {user["AuthenticationResult"]["IdToken"]}
      </Text>
    </Box>
  )
}

export default SessionPage