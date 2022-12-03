import {
  ChakraProvider,
} from "@chakra-ui/react";
import LoginForm from "./components/LoginForm";
import SessionPage from "./components/Session";
import SignupForm from "./components/SignupForm";
import ConfirmForm from "./components/Confirm";

// import { 
//   createBrowserRouter, 
//   RouterProvider,
// } from "react-router-dom"
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

  const [auth, setAuth] = useState({state: "LOGIN"})

  if (auth.state === "SIGNUP") {
    return (
      <ChakraProvider>
        <SignupForm setUser={setAuth}></SignupForm>
      </ChakraProvider>
    )
  }

  if (auth.state === "CONFIRM") {
    return (
      <ChakraProvider>
        <ConfirmForm setUser={setAuth} user={auth}></ConfirmForm>
      </ChakraProvider>
    )
  }

  if (auth.state === "AUTHENTICATED") {
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
