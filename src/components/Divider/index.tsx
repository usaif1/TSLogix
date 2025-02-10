// dependencies
import React from "react";

type Props = {
  height: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
};

enum DIVIDER_HEIGHT {
  "xs" = "h-2",
  "sm" = "h-4",
  "md" = "h-6",
  "lg" = "h-8",
  "xl" = "h-10",
  "2xl" = "h-12",
}

const Divider: React.FC<Props> = ({ height = "sm" }) => {
  return <div className={`w-full ${DIVIDER_HEIGHT[height]}`} />;
};

export default Divider;
