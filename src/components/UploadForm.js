// haimtran 10 AUG 2022
// 1. amplify storage upload s3 and progress
// 2. create a custom upload form using react-hook-form

import {
  Flex,
  Button,
  FormControl,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import { useRef, useState } from "react";

export const UploadFormS3 = ({ processFile, setImages } ) => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Your File ...");
  const [progress, setProgress] = useState(1);

  const uploadButton = (
    <Button
      colorScheme="purple"
      minW={"150px"}
      onClick={async () => {
        await processFile(selectedFile, setProgress);
        setSelectedFile(null);
        // list images against
      }}
    >
      Upload
    </Button>
  );

  const chooseFileButton = (inputRef) => (
    <Button
      colorScheme="purple"
      minW={"150px"}
      onClick={() => inputRef.current?.click()}
    >
      Choose File
    </Button>
  );

  const HiddenInput = () => {
    return (
      <input
        type={"file"}
        name={"FirstName"}
        ref={inputRef}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
            setSelectedFile(event.target.files[0]);
            setProgress(0);
          }
        }}
        style={{ display: "none" }}
      ></input>
    );
  };

  return (
    <Flex width={"100%"} direction={"column"} gap={"5px"}>
      <FormControl>
        <InputGroup>
          <InputLeftElement>
            <Icon as={FiFile}></Icon>
          </InputLeftElement>
          <HiddenInput></HiddenInput>
          <Input
            placeholder="Your file ..."
            value={fileName}
            onChange={(e) => console.log(e)}
          ></Input>
          <InputRightElement width={"auto"}>
            {selectedFile ? uploadButton : chooseFileButton(inputRef)}
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Progress value={progress}></Progress>
    </Flex>
  );
};
