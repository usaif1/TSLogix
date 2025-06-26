/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AccordionItem } from "@szhsin/react-accordion";
import { NavLink } from "react-router";

// types
import { Icon } from "@phosphor-icons/react";

type Props = {
  item: {
    title: string;
    route: string;
    icon: Icon;
  };
};

const HomeRoute: React.FC<Props> = ({ item }) => {
  const isActive = window.location.pathname === item.route;

  return (
    <AccordionItem
      className="w-full"
      itemKey="/"
      header={() => (
        <NavLink to="/" className="route">
          <div className={`flex items-center gap-2 min-w-0 ${isActive ? "font-bold" : ""}`}>
            <div className="flex-shrink-0">
              <item.icon
                color="white"
                size={20}
                weight={isActive ? "bold" : "regular"}
              />
            </div>
            <span className="truncate text-white" title={item.title}>
              {item.title}
            </span>
          </div>
        </NavLink>
      )}
    />
  );
};

export default HomeRoute;
