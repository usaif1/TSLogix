// dependencies
import React, { useMemo } from "react";
import { Plus } from "@phosphor-icons/react";

// components
import { OrderBtnGroup } from "../components";
import { Divider, Text, Searchbar } from "@/components";
import {
  EntryRecordsTable,
  NewEntryOrderForm,
  NewMassEntryOrderForm,
} from "./components";

// store
import { GlobalStore } from "@/globalStore";

const Entry: React.FC = () => {
  const openModal = GlobalStore.use.openModal();

  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Generate Order",
        icon: Plus,
        onClick: () => {
          GlobalStore.setState((prevState) => ({
            ...prevState,
            modalComponent: NewEntryOrderForm,
          }));
          openModal();
        },
      },
      {
        title: "Generate Mass Order",
        icon: Plus,
        onClick: () => {
          GlobalStore.setState((prevState) => ({
            ...prevState,
            modalComponent: NewMassEntryOrderForm,
          }));
          openModal();
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Entry Order
      </Text>
      <Divider />
      <Searchbar value="" placeholder="Enter Document Number" />
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
