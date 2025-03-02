// dependencies
import React from "react";

// components
import { Divider, Text } from "@/components";
import { NewMassEntryOrderForm } from "./components";

const NewEntry: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        New Mass Entry
      </Text>
      <Divider height="lg" />
      <NewMassEntryOrderForm />
    </div>
  );
};

export default NewEntry;
