import { Box, Button, Text, Image, Flex, VStack, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { listObjects, getS3Object } from "../services/storage";

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
          alignItems={'center'}
          padding={"5px"}
          backgroundColor={"gray.100"}
          marginBottom={"5px"}
        >
          <Text>{image}</Text>
          <Button
            colorScheme={"purple"}
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

const SessionPage = ({ user }) => {
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

  return (
    <Box
      margin={"auto"}
      maxW={"1000px"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <VStack
        // minHeight={'100vh'}
      >
        <ViewImage imageUrl={imageUrl}></ViewImage>
        <ListImages
          user={user}
          images={images}
          setImageUrl={setImageUrl}
        ></ListImages>
        <Spacer></Spacer>
        <Button
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
      </VStack>
    </Box>
  );
};

export default SessionPage;
