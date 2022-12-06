import {
  Box,
  Button,
  HStack,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../config";
import { getS3Object } from "../services/storage";

const fetchMessages = async (token) => {
  try {
    const { data, status } = await axios.get(config.API_URL_MESSAGE, {
      // crossdomain: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    // console.log(data);
    // console.log(status);
    return data.Items;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const saveMessageTest = async (token, story) => {
  try {
    const { data, status } = await axios.post(
      config.API_URL_MESSAGE,
      { message: story },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(data);
    console.log(status);
  } catch (error) {
    console.log(error);
  }
};

const saveMessage = async (token, story) => {
  try {
    const { data, status } = await axios.post(
      config.API_URL_POLLY,
      { message: story, file_name: `user_${Date.now().toString()}.mp3`}
      // {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // }
    );
    console.log(data);
    console.log(status);
  } catch (error) {
    console.log(error);
  }
};

const Message = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [story, setStory] = useState("");
  const [messages, setMessages] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");

  const playMessage = async (token, key) => {
    console.log("audio url for ", key);
    const url = await getS3Object(token, key);
    setAudioUrl(url);
    console.log(url);
  };

  const getMessages = async () => {
    const items = await fetchMessages(user.IdToken);
    console.log(items);
    setMessages(items);
  };

  useEffect(() => {
    getMessages();
  }, []);

  return (
    <Box
      bg={"gray.100"}
      maxWidth={"1000px"}
      justifyContent={"center"}
      margin={"auto"}
      padding={"20px"}
      display="flex"
      flexDirection={"column"}
      maxHeight={"100vh"}
    >
      <VStack
        height={"60vh"}
        align={"flex-end"}
        overscrollY={"auto"}
        overflowY={"auto"}
      >
        {messages.map((message, id) => (
          <HStack
            key={id}
            bgColor={"white"}
            margin={"5px"}
            padding={"5px"}
            align={"flex-start"}
          >
            <Text noOfLines={2}>
              {message.key} and {message.message}
            </Text>
            <Spacer></Spacer>
            <Button
              colorScheme={"green"}
              minWidth={"90px"}
              onClick={async () => {
                await playMessage(user.IdToken, message.key);
                onOpen();
              }}
            >
              Play
            </Button>
            <Button colorScheme={"purple"} minWidth={"90px"}>
              Delete
            </Button>
          </HStack>
        ))}
      </VStack>

      <Textarea
        marginTop={"20px"}
        bgColor={"orange.100"}
        placeholder="type your story here ..."
        size={"md"}
        minH={"200px"}
        value={story}
        overflowY={true}
        onChange={(event) => {
          setStory(event.target.value);
        }}
      ></Textarea>

      <Button
        colorScheme={"purple"}
        minW={"200px"}
        marginTop={"20px"}
        onClick={async () => {
          await saveMessage(user.IdToken, story);
          getMessages();
        }}
      >
        Save Message
      </Button>

      <Button
          marginTop={"20px"}
          colorScheme={"orange"}
          minWidth={"300px"}
          padding={"20px"}
          onClick={async () => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Sign Out
        </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Play It (please wait)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <audio controls>
              <source src={audioUrl}></source>
            </audio>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Message;
