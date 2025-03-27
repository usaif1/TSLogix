// dependencies
import React, { useEffect } from "react";

// components
import { Text, Divider } from "@/components";
import DepartureApprovedForm from "./components/DepartureApprovedForm";
// service
import { ProcessService } from "@/globalService";

const DepartureApproved: React.FC = () => {
  useEffect(() => {
    ProcessService.fetchDepartureFormFields();
  }, []);
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        New Departure
      </Text>
      <Divider height="lg" />
      <DepartureApprovedForm />
    </div>
  );
};

export default DepartureApproved;
