/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";

import { Button, Divider, Text } from "@/components";

// types
import { ProductData } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "2.5rem",
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#94a3b8",
    },
  }),
};

interface ProductEntryCardProps {
  product: ProductData;
  index: number;
  products: any[];
  temperatureRanges: any[];
  shouldDisableFields: boolean;
  onUpdate: (updatedProduct: Partial<ProductData>) => void;
  onRemove: () => void;
}

const ProductEntryCard: React.FC<ProductEntryCardProps> = ({
  product,
  index,
  products,
  temperatureRanges,
  shouldDisableFields,
  onUpdate,
  onRemove,
}) => {
  const { t } = useTranslation(['process', 'common']);

  // Get selected product details
  const selectedProduct = useMemo(() => {
    return products.find(p => p.value === product.product_id);
  }, [products, product.product_id]);

  // Get selected product's temperature range
  const productTemperatureRange = useMemo(() => {
    if (selectedProduct?.temperature_range) {
      return temperatureRanges.find(tr => 
        tr.value === selectedProduct.temperature_range.range_id ||
        tr.label === selectedProduct.temperature_range.range
      );
    }
    return null;
  }, [selectedProduct, temperatureRanges]);

  const handleSelectChange = (field: string, selectedOption: any) => {
    onUpdate({ [field]: selectedOption?.value || "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    if (date) {
      onUpdate({ [field]: date });
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      {/* Product Header */}
      <div className="flex justify-between items-center mb-4">
        <Text size="md" weight="font-semibold" additionalClass="text-gray-800">
          {t('process:product')} #{index + 1}
          {selectedProduct && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              ({selectedProduct.label})
            </span>
          )}
        </Text>
        <Button
          type="button"
          onClick={onRemove}
          additionalClass="px-3 py-1 text-xs"
        >
          {t('process:remove')}
        </Button>
      </div>

      {/* Product Selection Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Product Selection */}
        <div className="flex flex-col">
          <label htmlFor={`product_${product.id}`}>
            {t('process:product')} *
          </label>
          <Select
            options={products}
            styles={reactSelectStyle}
            inputId={`product_${product.id}`}
            value={products.find(p => p.value === product.product_id) || null}
            onChange={(selectedOption) => {
              handleSelectChange("product_id", selectedOption);
              // Auto-fill product description if available
              if (selectedOption?.product_code) {
                onUpdate({ 
                  product_description: `${selectedOption.label} (${selectedOption.product_code})` 
                });
              }
            }}
            placeholder={t('process:select_product')}
            isDisabled={shouldDisableFields}
          />
        </div>

        {/* Product Code (Display only) */}
        <div className="flex flex-col">
          <label htmlFor={`product_code_${product.id}`}>
            {t('process:product_code')}
          </label>
          <input
            type="text"
            id={`product_code_${product.id}`}
            value={selectedProduct?.product_code || ""}
            readOnly
            className="h-10 border border-slate-400 rounded-md px-4 bg-gray-100 text-gray-600"
            placeholder={t('process:auto_filled')}
          />
        </div>

        {/* Temperature Range (Display only) */}
        <div className="flex flex-col">
          <label htmlFor={`temp_range_${product.id}`}>
            {t('process:temperature_range')}
          </label>
          <input
            type="text"
            id={`temp_range_${product.id}`}
            value={productTemperatureRange ? 
              `${productTemperatureRange.label} (${selectedProduct?.temperature_range?.min_celsius}°C - ${selectedProduct?.temperature_range?.max_celsius}°C)` : 
              ""
            }
            readOnly
            className="h-10 border border-slate-400 rounded-md px-4 bg-gray-100 text-gray-600"
            placeholder={t('process:auto_filled')}
          />
        </div>
      </div>

      <Divider />

      {/* Quantity and Weight Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor={`quantity_packaging_${product.id}`}>
            {t('process:quantity_packaging')} *
          </label>
          <input
            type="number"
            id={`quantity_packaging_${product.id}`}
            name="quantity_packaging"
            value={product.quantity_packaging}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`total_qty_${product.id}`}>
            {t('process:total_quantity')} *
          </label>
          <input
            type="number"
            id={`total_qty_${product.id}`}
            name="total_qty"
            value={product.total_qty}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`total_weight_${product.id}`}>
            {t('process:total_weight')} (kg) *
          </label>
          <input
            type="number"
            id={`total_weight_${product.id}`}
            name="total_weight"
            value={product.total_weight}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`total_volume_${product.id}`}>
            {t('process:total_volume')} (m³)
          </label>
          <input
            type="number"
            id={`total_volume_${product.id}`}
            name="total_volume"
            value={product.total_volume}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="0.001"
          />
        </div>
      </div>

      <Divider />

      {/* Palettes Row */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor={`palettes_${product.id}`}>
            {t('process:palettes')}
          </label>
          <input
            type="number"
            id={`palettes_${product.id}`}
            name="palettes"
            value={product.palettes}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      <Divider />

      {/* Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor={`mfd_date_${product.id}`}>
            {t('process:manufacturing_date')} *
          </label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id={`mfd_date_${product.id}`}
            selected={product.mfd_date_time}
            onChange={(date) => handleDateChange("mfd_date_time", date)}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={10}
            dateFormat="MM/dd/yyyy"
            maxDate={new Date()}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`expiration_date_${product.id}`}>
            {t('process:expiration_date')} *
          </label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id={`expiration_date_${product.id}`}
            selected={product.expiration_date}
            onChange={(date) => handleDateChange("expiration_date", date)}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={20}
            dateFormat="MM/dd/yyyy"
            minDate={new Date()}
          />
        </div>
      </div>

      <Divider />

      {/* Additional Information Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor={`presentation_${product.id}`}>
            {t('process:presentation')}
          </label>
          <input
            type="text"
            id={`presentation_${product.id}`}
            name="presentation"
            value={product.presentation}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            placeholder={t('process:enter_presentation')}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`insured_value_${product.id}`}>
            <span>$</span> {t('process:insured_value')}
          </label>
          <input
            type="number"
            id={`insured_value_${product.id}`}
            name="insured_value"
            value={product.insured_value}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Description and Technical Specification Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor={`product_description_${product.id}`}>
            {t('process:product_description')}
          </label>
          <textarea
            id={`product_description_${product.id}`}
            name="product_description"
            value={product.product_description}
            onChange={handleInputChange}
            rows={3}
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500 resize-none"
            placeholder={t('process:enter_product_description')}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={`technical_specification_${product.id}`}>
            {t('process:technical_specification')}
          </label>
          <textarea
            id={`technical_specification_${product.id}`}
            name="technical_specification"
            value={product.technical_specification}
            onChange={handleInputChange}
            rows={3}
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500 resize-none"
            placeholder={t('process:enter_technical_specification')}
          />
        </div>
      </div>

      {/* Product Summary */}
      {product.product_id && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Text size="sm" additionalClass="text-blue-800">
            <strong>{t('process:summary')}:</strong>{" "}
            {selectedProduct?.label} - {product.quantity_packaging} packages - 
            {product.total_weight}kg
            {product.palettes && ` - ${product.palettes} palettes`}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ProductEntryCard;