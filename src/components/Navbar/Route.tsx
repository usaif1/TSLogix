// src/components/Navbar/Route.tsx
import React from "react";
import { NavLink, useLocation } from "react-router";
import { CaretDown } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

type Props = {
  item: {
    title: string;
    icon: Icon;
    route: string;
  };
  isOpen: boolean;
  hasSubroutes: boolean;
};

const Route: React.FC<Props> = ({ item, isOpen, hasSubroutes }) => {
  const location = useLocation();
  const isActive = location.pathname === item.route;

  // If there are no subroutes, wrap in a NavLink
  if (!hasSubroutes) {
    return (
      <NavLink
        to={item.route}
        className={({ isActive }) =>
          `w-full text-white flex py-3 gap-2 ${
            isActive ? "route_active font-bold" : ""
          }`
        }
      >
        <item.icon size={20} weight={isActive ? "bold" : "regular"} />
        {item.title}
      </NavLink>
    );
  }

  // Otherwise render your accordion header (or whatever) for subroutes
  return (
    <div className={`route ${isActive ? "route_active" : ""}`}>
      <div className="flex items-center gap-2">
        <item.icon size={20} weight={isActive ? "bold" : "regular"} />
        {item.title}
      </div>
      <CaretDown
        className={`caret_icon transform transition-transform ${
          isOpen ? "-rotate-180" : "rotate-0"
        }`}
      />
    </div>
  );
};

export default Route;
