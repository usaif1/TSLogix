// dependencies
import React from "react";

// types
import {
  TEXT_COLORS,
  TEXT_SIZE,
  TEXT_SIZE_ENUM,
  FONT_WEIGHT,
} from "@/styling/theme";

type Props = {
  color?: TEXT_COLORS;
  children: React.ReactNode;
  additionalClass?: string;
  size?: TEXT_SIZE;
  weight?: FONT_WEIGHT;
  title?: string; // Add title prop for tooltips
};

const Text: React.FC<Props> = ({
  color = "text-black",
  children,
  additionalClass = "",
  size = "base",
  weight = "normal",
  title, 
}) => {
  return (
    <p
      className={`${color} ${weight} ${TEXT_SIZE_ENUM[size]} ${additionalClass}`}
      title={title}
    >
      {children}
    </p>
  );
};

export default Text;
