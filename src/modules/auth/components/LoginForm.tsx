// dependencies
import React from "react";
import { ArrowRight } from "@phosphor-icons/react";

// components
import { Button, Text } from "@/components";

// store
import { AuthStore } from "@/globalStore";

const LoginForm: React.FC = () => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    AuthStore.setState((prevState) => ({
      ...prevState,
      authUser: true,
    }));
  };

  return (
    <form className="login_form" onSubmit={onSubmit}>
      <div className="login_form_block">
        <label>Email</label>
        <input
          type="email"
          className="login_input mt-1.5"
          placeholder="johndoe@text.com"
          autoComplete="off"
        />
      </div>
      <div className="login_form_block">
        <label>Password</label>
        <input type="password" className="login_input mt-1.5" />
      </div>

      <Button type="submit">
        <div className="flex gap-x-2 items-center">
          <Text color="text-white" weight="font-normal">
            Login
          </Text>
          <ArrowRight weight="bold" />
        </div>
      </Button>
    </form>
  );
};

export default LoginForm;
