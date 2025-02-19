// dependencies
import React, { useMemo } from "react";
import { Plus } from "@phosphor-icons/react";

// components
import { OrderBtnGroup } from "../components";
import { Divider, Text, Searchbar } from "@/components";
import { NewEntryOrderForm, NewMassEntryOrderForm } from "./components";

// store
import { GlobalStore } from "@/globalStore";

const Entry: React.FC = () => {
  const openModal = GlobalStore.use.openModal();

  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Generate Order",
        route: "/processes/entry/new",
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
        route: "/processes/entry/new/bulk",
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
    </div>
  );
};

export default Entry;
