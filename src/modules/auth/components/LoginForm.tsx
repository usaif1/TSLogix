// dependencies
import React from "react";
import { ArrowRight } from "@phosphor-icons/react";

// components
import { Button, Text } from "@/components";

const LoginForm: React.FC = () => {
  return (
    <form className="login_form">
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

      <Button additionalClass="!bg-[#2C2B6D]">
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
