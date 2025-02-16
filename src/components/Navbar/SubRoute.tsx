// dependencies
import React from "react";
import { NavLink } from "react-router";

type LinkProps = {
  item: {
    title: string;
    route: string;
  };
};

const SubRoute: React.FC<LinkProps> = ({ item }) => {
  return (
    <NavLink
      to={item.route}
      className="text-white w-full hover:bg-active pl-8 text-start py-1 rounded-md font-medium"
    >
      {item.title}
    </NavLink>
  );
};

export default SubRoute;
