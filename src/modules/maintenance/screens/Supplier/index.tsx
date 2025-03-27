// dependencies
import React, { useMemo, useEffect } from "react";

// components
import { Divider, Text, Searchbar } from "@/components";
import OrderBtnGroup from "../../../process/components/OrderBtnGroup";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { SupplierService } from "../../api/maintenance.service";

const Supplier: React.FC = () => {
  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Look For",
        icon: MagnifyingGlass,
        route: "/maintenance/supplier",
      },
      {
        title: "Add",
        icon: Plus,
        route: "/maintenance/supplier/new",
      },
    ];
  }, []);

  useEffect(() => {
    SupplierService.fetchAllSuppliers();
  }, []);
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Supplier Maintenance
      </Text>
      <Divider />
      <Searchbar placeholder="Search Supplier" />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
    </div>
  );
};

export default Supplier;
