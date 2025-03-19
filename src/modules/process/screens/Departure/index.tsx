// dependencies
import React, { useEffect } from "react";
import { Plus } from "@phosphor-icons/react";

// services
import { ProcessService } from "@/globalService";

// components
import { Divider, Text, Searchbar, Button } from "@/components";
import { DepartureOptions, DepartureRecordsTable } from "./components";

// store
import { GlobalStore } from "@/globalStore";

const Entry: React.FC = () => {
  useEffect(() => {
    ProcessService.fetchAllDepartureOrders();
  }, []);
  const openModal = GlobalStore.use.openModal();

  const onClick = () => {
    GlobalStore.setState((prevState) => ({
      ...prevState,
      ModalComponent: DepartureOptions,
    }));

    openModal();
  };

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Departure Order
      </Text>
      <Divider />
      <Searchbar placeholder="Enter Document Number" />
      <Divider />
      <Button variant="action" additionalClass="!w-56" onClick={onClick}>
        <div className="flex items-center gap-x-2">
          <Text color="text-white">Generate Order</Text>
          <Plus className="text-white" weight="bold" size={16} />
        </div>
      </Button>
      <Divider />
      <div className="h-4/5 bg-white rounded-md px-2 py-1.5">
        <DepartureRecordsTable />
      </div>
    </div>
  );
};

export default Entry;
