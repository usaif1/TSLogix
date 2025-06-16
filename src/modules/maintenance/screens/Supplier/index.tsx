import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Text } from "@/components";
import { SupplierService } from "../../api/maintenance.service";
import SuppliersTable from "./components/SuppliersTable";

const Supplier: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  useEffect(() => {
    SupplierService.fetchAllSuppliers();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('supplier_maintenance')}
      </Text>
      <Divider />
      <SuppliersTable />
    </div>
  );
};

export default Supplier;
