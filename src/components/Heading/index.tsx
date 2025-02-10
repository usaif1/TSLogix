// dependencies
import React from "react";

// types
import { TEXT_COLORS } from "@/styling/theme";

type Props = {
  color?: TEXT_COLORS;
  children: React.ReactNode;
  classname?: string;
};

const Heading: React.FC<Props> = ({
  color = "text-black",
  children,
  classname = "",
}) => {
  return (
    <p className={`${color} text-2xl font-bold ${classname}`}>{children}</p>
  );
};

export default Heading;
