import {
  ChakraProvider,
} from "@chakra-ui/react";
import LoginForm from "./components/LoginForm";
import SessionPage from "./components/Session";
import SignupForm from "./components/SignupForm";
import ConfirmForm from "./components/Confirm";

import { 
  createBrowserRouter, 
  RouterProvider,
} from "react-router-dom"
import { useState } from "react";



// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <LoginForm></LoginForm>
//   },
//   {
//     path: "/signup",
//     element: <SignupForm></SignupForm>
//   },
//   {
//     path: "/confirm",
//     element: <ConfirmForm></ConfirmForm>
//   },
//   {
//     path: "/session",
//     element: <SessionPage></SessionPage>
//   }
// ])

function App() {

  const [auth, setAuth] = useState(localStorage.getItem("user"))

  if (auth === "SIGNUP") {
    return (
      <ChakraProvider>
        <SignupForm setUser={setAuth}></SignupForm>
      </ChakraProvider>
    )
  }

  if (auth === "CONFIRM") {
    return (
      <ChakraProvider>
        <ConfirmForm></ConfirmForm>
      </ChakraProvider>
    )
  }

  if (auth) {
    return (
      <ChakraProvider>
        <SessionPage user={auth}></SessionPage>
      </ChakraProvider>
    )
  }

  return (
    <ChakraProvider>
     <LoginForm setAuth={setAuth}></LoginForm>
    </ChakraProvider>
  );
}

export default App;
