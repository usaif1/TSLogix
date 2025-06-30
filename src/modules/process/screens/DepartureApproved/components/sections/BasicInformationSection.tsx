import React, { useMemo } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { useTranslation } from "react-i18next";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
  control: (style: CSSObjectWithLabel) => ({
    ...style,
    minHeight: "2.5rem",
  }),
};

interface Props {
  formData: DepartureFormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSelectChange: (name: string, selectedOption: any) => void;
  isSubmitting: boolean;
}

const BasicInformationSection: React.FC<Props> = ({
  formData,
  handleSelectChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);
  const { 
    departureFormFields, 
    warehouses, 
    productsWithInventory,
    loaders 
  } = ProcessesStore();

  const isLoadingProducts = loaders["processes/load-products-inventory"];

  // Convert products to select options
  const productOptions = useMemo(() => {
    return productsWithInventory.map(product => ({
      value: product.product_id.toString(),
      label: `${product.product_name} (${product.total_packaging} pkg, ${product.total_weight} kg)`,
      option: product.product_name
    }));
  }, [productsWithInventory]);

  // Convert warehouses to select options
  const warehouseOptions = useMemo(() => {
    return warehouses.map(warehouse => ({
      value: warehouse.warehouse_id.toString(),
      label: warehouse.name,
      option: warehouse.name
    }));
  }, [warehouses]);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="personnel">{t('process:personnel_in_charge')}</label>
        <Select
          options={departureFormFields.personnel}
          styles={reactSelectStyle}
          inputId="personnel"
          name="personnel"
          value={formData.personnel}
          onChange={(selected) => handleSelectChange("personnel", selected)}
          isDisabled={isSubmitting}
          placeholder={t('process:select_personnel')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="warehouse">{t('process:warehouse')}</label>
        <Select
          options={warehouseOptions}
          styles={reactSelectStyle}
          inputId="warehouse"
          name="warehouse"
          value={formData.warehouse}
          onChange={(selected) => handleSelectChange("warehouse", selected)}
          isDisabled={isSubmitting}
          placeholder={t('process:select_warehouse')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="product">{t('process:product')}</label>
        <Select
          options={productOptions}
          styles={reactSelectStyle}
          inputId="product"
          name="product"
          value={formData.product}
          onChange={(selected) => handleSelectChange("product", selected)}
          isDisabled={isSubmitting || isLoadingProducts || !formData.warehouse?.value}
          isLoading={isLoadingProducts}
          placeholder={formData.warehouse?.value ? t('process:select_product') : t('process:select_warehouse_first')}
        />
      </div>
    </div>
  );
};

export default BasicInformationSection;