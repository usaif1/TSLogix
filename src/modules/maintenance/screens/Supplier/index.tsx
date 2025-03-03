// dependencies
import React, { useMemo } from "react";

// components
import { Divider, Text, Searchbar } from "@/components";
import OrderBtnGroup from "../../../process/components/OrderBtnGroup";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { EntryRecordsTable } from "@/modules/process/screens/Entry/components";

const Supplier: React.FC = () => {
  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Look For",
        icon: MagnifyingGlass,
        route: "/processes/entry/new",
      },
      {
        title: "Add",
        icon: Plus,
        route: "/maintenance/supplier/newsupplier",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Supplier Maintenance
      </Text>
      <Divider />
      <Searchbar placeholder="Search Supplier" />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
    </div>
  );
};

export default Supplier;