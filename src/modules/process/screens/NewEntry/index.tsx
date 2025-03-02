// dependencies
import React from "react";

// components
import { Divider, Text } from "@/components";
import { NewEntryOrderForm } from "./components";

const NewEntry: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        New Entry
      </Text>
      <Divider height="lg" />
      <NewEntryOrderForm />
    </div>
  );
};

export default NewEntry;
