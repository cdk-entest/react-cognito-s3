import { ChakraProvider } from "@chakra-ui/react";
import LoginForm from "./components/LoginForm";
import SessionPage from "./components/Session";
import SignupForm from "./components/SignupForm";
import ConfirmForm from "./components/Confirm";
import Message from "./components/Message";
import Upload from "./components/Upload";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext(null)

function App() {

  // TODO: AuthProvider 
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem("user")));

  const router = createBrowserRouter([
    {
      path: "/",
      element: <SessionPage user={auth}></SessionPage>,
    },
    {
      path: "/upload",
      element: <Upload user={auth}></Upload>
    },
    {
      path: "/message",
      element: <Message user={auth}></Message>,
    },
  ]);

  if (auth && auth.state === "SIGNUP") {
    return (
      <ChakraProvider>
        <SignupForm setUser={setAuth}></SignupForm>
      </ChakraProvider>
    );
  }

  if (auth && auth.state === "CONFIRM") {
    return (
      <ChakraProvider>
        <ConfirmForm setUser={setAuth} user={auth}></ConfirmForm>
      </ChakraProvider>
    );
  }

  if (auth && auth.state === "AUTHENTICATED") {
    return (
      <ChakraProvider>
        <RouterProvider router={router}></RouterProvider>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <LoginForm setAuth={setAuth}></LoginForm>
    </ChakraProvider>
);
}

export default App;
