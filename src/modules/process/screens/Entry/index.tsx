// dependencies
import React, { useMemo, useEffect } from "react";
import { Plus } from "@phosphor-icons/react";

// components
import { OrderBtnGroup } from "../../components";
import { Divider, Text, Searchbar } from "@/components";
import { EntryRecordsTable } from "./components";

// services
import { ProcessService } from "@/globalService";

const Entry: React.FC = () => {
  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Generate Order",
        icon: Plus,
        route: "/processes/entry/new",
      },
      {
        title: "Generate Mass Order",
        icon: Plus,
        route: "/processes/entry/mass",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ProcessService.fetchAllEntryOrders();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Entry Order
      </Text>
      <Divider />
      <Searchbar placeholder="Enter Document Number" />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <div className="h-4/5 bg-white rounded-md px-2 py-1.5">
        <EntryRecordsTable />
      </div>
    </div>
  );
};

export default Entry;
