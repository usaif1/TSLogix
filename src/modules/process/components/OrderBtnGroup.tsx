// depenencies
import React from "react";
import { Icon } from "@phosphor-icons/react";
import { NavLink } from "react-router";

// components

type OrderTypeItem = {
  title: string;
  icon: Icon;
  route: string;
};

type Props = {
  items: OrderTypeItem[];
};

const OrderBtnGroup: React.FC<Props> = ({ items }) => {
  return (
    <div className="flex items-center gap-x-4">
      {items.map((item) => {
        return (
          <NavLink
            to={item.route}
            key={item.title}
            className="!w-56 px-2 py-2 rounded-md font-bold bg-action-nav hover:bg-[#0F2F47] text-white flex justify-center cursor-pointer"
          >
            <div className="flex items-center gap-x-2">
              {item.title}
              <item.icon className="text-white" weight="bold" size={16} />
            </div>
          </NavLink>
        );
      })}
    </div>
  );
};

export default OrderBtnGroup;
