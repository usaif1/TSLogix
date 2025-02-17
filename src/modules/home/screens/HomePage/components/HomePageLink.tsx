// dependencies
import React from "react";
import { NavLink } from "react-router";

type Props = {
  item: {
    title: string;
    route: string;
  };
};

const HomePageLink: React.FC<Props> = ({ item }) => {
  return (
    <NavLink
      key={item.title}
      to={item.route}
      className={() => "home_page_link"}
    >
      {item.title}
    </NavLink>
  );
};

export default HomePageLink;
