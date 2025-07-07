import React from "react";
import { useTranslation } from "react-i18next";
// components
import { Divider, Text } from "@/components";
import AddProductComponent from "./components/AddProductComponent";

const NewProduct: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('add_new_product')}
      </Text>
      <Divider height="lg" />
      <AddProductComponent />
    </div>
  );
};

export default NewProduct;
