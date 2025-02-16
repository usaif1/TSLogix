// dependencies
import React from "react";

// components
import { LoginForm, LoginHeader } from "../components";
import { Divider } from "@/components";

const Login: React.FC = () => {
  return (
    <>
      <LoginHeader />
      <Divider height="xl" />
      <LoginForm />
    </>
  );
};

export default Login;
