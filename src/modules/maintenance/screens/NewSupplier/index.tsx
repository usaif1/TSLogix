import React, {useEffect} from "react";
// components
import { Divider, Text } from "@/components";
import SupplierRegistration from "./components/SupplierRegistration";
import { SupplierService } from "../../api/maintenance.service";

const NewSupplier: React.FC = () => {
    useEffect(() => {
      SupplierService.fetchSupplierFormFields();
    }, []);
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
