import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";

// components
import { Button, Text, Divider } from "@/components";

// types
import { SignInWithEmailPassword } from "@/types";

// store
import { AuthStore } from "@/globalStore";

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInWithEmailPassword>();
  const { login, authError, loaders, clearError } = AuthStore();
  const isLoading = loaders["auth/login"];

  const onSubmit = async (data: SignInWithEmailPassword) => {
    await login(data);
  };

  // Clear error when user starts typing again
  const handleInputChange = () => {
    if (authError) {
      clearError();
    }
  };

  return (
    <form className="login_form" onSubmit={handleSubmit(onSubmit)}>
      <div className="login_form_block">
        <label>Email</label>
        <input
          type="email"
          className={`login_input mt-1.5 ${
            errors.email ? "border-red-500" : ""
          }`}
          placeholder="johndoe@text.com"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
          })}
          onChange={handleInputChange}
        />
        {errors.email ? (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="login_form_block">
        <label>Password</label>
        <input
          type="password"
          className={`login_input mt-1.5 ${
            errors.password ? "border-red-500" : ""
          }`}
          autoComplete="current-password"
          {...register("password", {
            required: "Password is required",
          })}
          onChange={handleInputChange}
        />
        {errors.password ? (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        ) : null}
      </div>

      {authError ? (
        <>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{authError}</p>
          </div>
          <Divider height="xs" />
        </>
      ) : null}

      <Button type="submit" disabled={isLoading}>
        <div className="flex gap-x-2 items-center">
          <Text color="text-white" weight="font-normal">
            {isLoading ? "Logging in..." : "Login"}
          </Text>
          {!isLoading ? <ArrowRight weight="bold" /> : null}
        </div>
      </Button>
    </form>
  );
};

export default LoginForm;
