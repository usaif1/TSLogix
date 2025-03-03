import React from "react";
// components
import { Divider, Text } from "@/components";
import SupplierRegistration from "./components/SupplierRegistration";

const NewSupplier: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Supplier Registration 
      </Text>
      <Divider height="lg" />
      <SupplierRegistration />
    </div>
  );
};

export default NewSupplier;
