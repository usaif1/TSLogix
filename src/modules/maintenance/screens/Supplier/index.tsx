import React, { useEffect, useCallback, useMemo } from "react";
import debounce from "lodash.debounce";
import { Divider, Text, Searchbar } from "@/components";
import OrderBtnGroup from "../../../process/components/OrderBtnGroup";
import { Plus } from "@phosphor-icons/react";
import { SupplierService } from "../../api/maintenance.service";
import SuppliersTable from "./components/SuppliersTable";

const Supplier: React.FC = () => {
  const debouncedFetchSuppliers = useCallback(
    debounce((searchValue: string) => {
      SupplierService.fetchAllSuppliers(searchValue);
    }, 800),
    []
  );

  const handleSearch = (searchValue: string) => {
    debouncedFetchSuppliers(searchValue);
  };

  useEffect(() => {
    SupplierService.fetchAllSuppliers();
    return () => {
      debouncedFetchSuppliers.cancel();
    };
  }, [debouncedFetchSuppliers]);

  const buttonGroup = useMemo(
    () => [
      {
        title: "Add",
        icon: Plus,
        route: "/maintenance/supplier/new",
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Supplier Maintenance
      </Text>
      <Divider />
      <Searchbar
        searchButton={true}
        iconHidden={true}
        placeholder="Enter Supplier Name"
        onSearch={handleSearch}
      />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <SuppliersTable />
    </div>
  );
};

export default Supplier;
