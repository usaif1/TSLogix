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
      <div className="sm:h-3/5 2xl:h-full rounded-md py-1.5 overflow-scroll">
        <EntryRecordsTable />
      </div>
    </div>
  );
};

export default Entry;
