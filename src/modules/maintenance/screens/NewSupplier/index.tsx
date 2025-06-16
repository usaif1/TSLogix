import React from "react";
import { useTranslation } from "react-i18next";
// components
import { Divider, Text } from "@/components";
import SupplierRegistration from "./components/SupplierRegistration";

const NewSupplier: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('new_supplier')}
      </Text>
      <Divider height="lg" />
      <SupplierRegistration />
    </div>
  );
};

export default NewSupplier;
