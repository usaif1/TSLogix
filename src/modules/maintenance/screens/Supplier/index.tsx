import React, { useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import { Divider, Text, Searchbar } from "@/components";
import OrderBtnGroup from "../../../process/components/OrderBtnGroup";
import { Plus } from "@phosphor-icons/react";
import { SupplierService } from "../../api/maintenance.service";
import SuppliersTable from "./components/SuppliersTable";

const Supplier: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  
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
        title: t('common:add'),
        icon: Plus,
        route: "/maintenance/supplier/new",
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('supplier_maintenance')}
      </Text>
      <Divider />
      <div className="w-1/2">
        <Searchbar
          searchButton={true}
          iconHidden={true}
          placeholder={t('enter_supplier_name')}
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <SuppliersTable />
    </div>
  );
};

export default Supplier;
