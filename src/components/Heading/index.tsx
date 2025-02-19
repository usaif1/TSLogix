// dependencies
import React from "react";

// types
import { TEXT_COLORS } from "@/styling/theme";

type Props = {
  color?: TEXT_COLORS;
  children: React.ReactNode;
  additionalClass?: string;
};

const Heading: React.FC<Props> = ({
  color = "text-black",
  children,
  additionalClass = "",
}) => {
  return (
    <p className={`${color} text-2xl font-bold ${additionalClass}`}>
      {children}
    </p>
  );
};

export default Heading;
