// dependencies
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

// components
import { Text, Divider } from "@/components";
import DepartureApprovedForm from "./components/DepartureApprovedForm";
// service
import { ProcessService } from "@/modules/process/api/process.service";

const DepartureApproved: React.FC = () => {
  const { t } = useTranslation(['process']);

  useEffect(() => {
    // Fetch both departure form fields and warehouses
    const fetchData = async () => {
      try {
        await Promise.all([
          ProcessService.fetchDepartureFormFields(),
          ProcessService.fetchWarehouses(),
        ]);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('process:new_departure')}
      </Text>
      <Divider height="lg" />
      <DepartureApprovedForm />
    </div>
  );
};

export default DepartureApproved;
