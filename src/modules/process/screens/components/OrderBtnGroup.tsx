// depenencies
import React from "react";
import { Icon } from "@phosphor-icons/react";

// components
import { Button } from "@/components";

type OrderTypeItem = {
  title: string;
  icon: Icon;
};

type Props = {
  items: OrderTypeItem[];
};

const OrderBtnGroup: React.FC<Props> = ({ items }) => {
  return (
    <div className="w-6/12 flex items-center gap-x-4">
      {items.map((item) => {
        return (
          <Button key={item.title} variant="action">
            <div className="flex items-center gap-x-2">
              {item.title}
              <item.icon className="text-white" weight="bold" size={16} />
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default OrderBtnGroup;
