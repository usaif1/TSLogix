// dependencies
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

// components
import { Divider, Text } from "@/components";
import { NewEntryOrderForm } from "./components";

// service
import { ProcessService } from "@/globalService";

const NewEntry: React.FC = () => {
  const { t } = useTranslation(['process']);

  useEffect(() => {
    // ✅ Fix: Use the correct function names from ProcessService
    ProcessService.fetchEntryFormFields();  // Changed from fetchEntryOrderFormFields
    ProcessService.getCurrentEntryOrderNo(); // Changed from fetchCurrentOrderNumber
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('process:new_entry')}
      </Text>
      <Divider height="lg" />
      <NewEntryOrderForm />
    </div>
  );
};

export default NewEntry;