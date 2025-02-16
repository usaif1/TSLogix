// dependencies
import React from "react";
import { CaretDown } from "@phosphor-icons/react";
import { Icon } from "@phosphor-icons/react";

type LinkProps = {
  item: {
    title: string;
    route: string;
    icon: Icon;
  };
};

const Route: React.FC<LinkProps> = ({ item }) => {
  return (
    <div className="w-full text-white flex items-center justify-between py-3">
      <div className="flex items-center gap-x-2">
        <item.icon size={20} />
        {item.title}
      </div>
      <CaretDown />
    </div>
  );
};

export default Route;
