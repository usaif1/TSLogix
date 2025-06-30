// dependencies
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

// components
import { Text } from "@/components";
import ComprehensiveDepartureForm from "./components/ComprehensiveDepartureForm";

// service
import { ProcessService } from "@/modules/process/api/process.service";

const DepartureApproved: React.FC = () => {
  const { t } = useTranslation("process");
  
  console.log("DepartureApproved component loaded");

  useEffect(() => {
    ProcessService.loadDepartureFormFields();
    ProcessService.fetchWarehouses();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Text size="2xl" weight="font-bold">
          {t("departure_order")}
        </Text>
      </div>
      <ComprehensiveDepartureForm />
    </div>
  );
};

export default DepartureApproved;
