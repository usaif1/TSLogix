// dependencies
import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  additionalClass?: string;
}

const TextInput: React.FC<Props> = ({ additionalClass = "", ...props }) => {
  return (
    <input
      {...props}
      type={props.type}
      name={props.name}
      value={props.value}
      className={`w-full rounded-sm text-base py-1 px-1 focus-visible:outline-none ${
        props?.disabled
          ? "bg-salwa-disabled text-white"
          : "bg-salwa-beige text-salwa-black"
      } ${additionalClass}`}
    />
  );
};

export default TextInput;
