// depenencies
import React from "react";
import { Icon } from "@phosphor-icons/react";

// components
import { Button } from "@/components";

type OrderTypeItem = {
  title: string;
  icon: Icon;
  onClick: () => void;
};

type Props = {
  items: OrderTypeItem[];
};

const OrderBtnGroup: React.FC<Props> = ({ items }) => {
  return (
    <div className="flex items-center gap-x-4">
      {items.map((item) => {
        return (
          <Button
            key={item.title}
            variant="action"
            onClick={item.onClick}
            additionalClass="!w-56"
          >
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
