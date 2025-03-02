// dependencies
import React from "react";

// types
import { ButtonVariant, ButtonVariantEnum } from "@/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "submit" | "reset" | "button";
  additionalClass?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  variant = "primary",
  children,
  type = "button",
  additionalClass = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${
        ButtonVariantEnum[variant]
      } px-2 py-2 rounded-md font-bold  ${additionalClass} flex justify-center cursor-pointer ${
        disabled ? "!bg-gray-400" : ""
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
