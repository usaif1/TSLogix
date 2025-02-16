// dependencies
import React from "react";

// components
import { LoginForm, LoginHeader } from "./components";

const LoginPage: React.FC = () => {
  return (
    <div>
      <LoginHeader />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
