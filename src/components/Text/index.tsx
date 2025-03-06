// dependencies
import React from "react";

// types
import {
  TEXT_COLORS,

  // text size
  TEXT_SIZE,
  TEXT_SIZE_ENUM,

  // text weight
  FONT_WEIGHT,
} from "@/styling/theme";

type Props = {
  color?: TEXT_COLORS;
  children: React.ReactNode;
  additionalClass?: string;
  size?: TEXT_SIZE;
  weight?: FONT_WEIGHT;
};

const Text: React.FC<Props> = ({
  color = "text-black",
  children,
  additionalClass = "",
  size = "base",
  weight = "normal",
}) => {
  return (
    <p
      className={`${color} ${weight} ${TEXT_SIZE_ENUM[size]} ${additionalClass} `}
    >
      {children}
    </p>
  );
};

export default Text;
