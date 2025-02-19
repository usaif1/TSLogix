// dependencies
import React from "react";
import { Plus } from "@phosphor-icons/react";

// components
import { OrderBtnGroup } from "../components";
import { Divider, Text, Searchbar } from "@/components";

const buttonGroup = [
  {
    title: "Generate Order",
    route: "/processes/entry/new",
    icon: Plus,
  },
  {
    title: "Generate Mass Order",
    route: "/processes/entry/new/bulk",
    icon: Plus,
  },
];

const Entry: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Entry Order
      </Text>
      <Divider />
      <Searchbar value="" placeholder="Enter Document Number" />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
    </div>
  );
};

export default Entry;
