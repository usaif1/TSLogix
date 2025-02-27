// dependencies
import React from "react";
import { NavLink } from "react-router";

// types
import { ButtonVariant, ButtonVariantEnum } from "@/types";

type Props = {
  title: string;
  route: string;
  variant?: ButtonVariant;
  additionalClass?: string;
};

const Anchor: React.FC<Props> = ({
  route,
  title,
  variant = "action",
  additionalClass = "",
}) => {
  return (
    <NavLink
      to={route}
      className={`${ButtonVariantEnum[variant]} px-2 py-2 rounded-md font-bold  flex justify-center cursor-pointer ${additionalClass}`}
    >
      {title}
    </NavLink>
  );
};

export default Anchor;
