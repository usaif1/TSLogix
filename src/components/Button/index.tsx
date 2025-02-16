// dependencies
import React from "react";

// types
import {
  ButtonBgColors,
  ButtonTextColors,
  ButtonBgColorsEnum,
  ButtonTextColorsEnum,
} from "@/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  bgColor?: ButtonBgColors;
  textColor?: ButtonTextColors;
  children: React.ReactNode;
  type?: "submit" | "reset" | "button";
  additionalClass?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  bgColor = "blue",
  textColor = "white",
  children,
  type = "button",
  additionalClass = "",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={`w-full ${ButtonBgColorsEnum[bgColor]} ${ButtonTextColorsEnum[textColor]} px-2 py-2 rounded-md font-bold  ${additionalClass} flex justify-center`}
    >
      {children}
    </button>
  );
};

export default Button;
