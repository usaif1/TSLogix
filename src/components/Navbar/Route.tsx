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
          `w-full text-white flex py-3 gap-2 items-center min-w-0 ${
            isActive ? "route_active font-bold" : ""
          }`
        }
      >
        <div className="flex-shrink-0">
          <item.icon size={20} weight={isActive ? "bold" : "regular"} />
        </div>
        <span className="truncate" title={item.title}>
          {item.title}
        </span>
      </NavLink>
    );
  }

  // Otherwise render your accordion header (or whatever) for subroutes
  return (
    <div className={`route ${isActive ? "route_active" : ""}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex-shrink-0">
          <item.icon size={20} weight={isActive ? "bold" : "regular"} />
        </div>
        <span className="truncate" title={item.title}>
          {item.title}
        </span>
      </div>
      <div className="flex-shrink-0">
        <CaretDown
          className={`caret_icon transform transition-transform ${
            isOpen ? "-rotate-180" : "rotate-0"
          }`}
        />
      </div>
    </div>
  );
};

export default Route;
