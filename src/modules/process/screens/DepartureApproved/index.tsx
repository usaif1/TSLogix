// dependencies
import React from "react";

// components
import { Text, Divider } from "@/components";
import DepartureApprovedForm from "./components/DepartureApprovedForm";

const DepartureApproved: React.FC = () => {
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
