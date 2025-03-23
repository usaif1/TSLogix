// dependencies
import React, { useEffect } from "react";

// components
import { Divider, Text } from "@/components";
import { NewEntryOrderForm } from "./components";

// service
import { ProcessService } from "@/globalService";

const NewEntry: React.FC = () => {
  useEffect(() => {
    ProcessService.fetchEntryOrderFormFields();
    ProcessService.fetchCurrentOrderNumber();
  }, []);
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
