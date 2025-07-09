/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Button, Text } from "@/components";
import { useTranslation } from "react-i18next";

// ✅ Updated ProductData interface to match the new schema
interface ProductData {
  id: string;
  product_id: string;
  supplier_id: string;
  serial_number: string;
  lot_series: string;
  inventory_quantity: string;
  package_quantity: string;
  weight_kg: string;
  volume_m3: string;
  quantity_pallets: string;
  presentation: string;
  product_description: string;
  insured_value: string;
  technical_specification: string;
  manufacturing_date: Date;
  expiration_date: Date;
  temperature_range: string;
  humidity: string;
  health_registration: string;
  product_code?: string; // Added optional product_code field
}

interface ProductEntryCardProps {
  product: ProductData;
  index: number;
  products: Array<{ option: string; value: string; label: string; product_code?: string }>;
  suppliers: Array<{ option: string; value: string; label: string }>;
  temperatureRanges: Array<{ option: string; value: string; label: string }>;
  shouldDisableFields: boolean;
  onUpdate: (updatedProduct: Partial<ProductData>) => void;
  onRemove: () => void;
}

const presentationOptions = [
  { option: "CAJA", value: "CAJA", label: "Caja" },
  { option: "PALETA", value: "PALETA", label: "Paleta" },
  { option: "SACO", value: "SACO", label: "Saco" },
  { option: "UNIDAD", value: "UNIDAD", label: "Unidad" },
  { option: "PAQUETE", value: "PAQUETE", label: "Paquete" },
  { option: "TAMBOS", value: "TAMBOS", label: "Tambos" },
  { option: "BULTO", value: "BULTO", label: "Bulto" },
  { option: "OTRO", value: "OTRO", label: "Otro" },
];

const temperatureOptions = [
  { option: "RANGE_15_30", value: "RANGE_15_30", label: "15°C - 30°C" },
  { option: "RANGE_15_25", value: "RANGE_15_25", label: "15°C - 25°C" },
  { option: "RANGE_2_8", value: "RANGE_2_8", label: "2°C - 8°C" },
  { option: "AMBIENTE", value: "AMBIENTE", label: "Ambiente" },
];

const ProductEntryCard: React.FC<ProductEntryCardProps> = ({
  product,
  index,
  products,
  suppliers,
  shouldDisableFields,
  onUpdate,
  onRemove,
}) => {
  const { t } = useTranslation(["process", "common"]);

  const handleChange = (field: keyof ProductData, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleSelectChange = (field: keyof ProductData, selectedOption: any) => {
    if (field === 'product_id') {
      // ✅ When product changes, also update product_description and product_code
      const selectedProduct = products.find(p => p.value === selectedOption?.value);
      console.log("Selected product for code lookup:", selectedProduct); // Debug log
      
      onUpdate({ 
        [field]: selectedOption?.value || "",
        product_description: selectedProduct?.label || "",
        product_code: selectedProduct?.product_code || "" // ✅ Auto-populate product code
      });
    } else {
      onUpdate({ [field]: selectedOption?.value || "" });
    }
  };

  // Find current selections for selects
  const currentProduct = products.find(p => p.value === product.product_id) || null;
  const currentSupplier = suppliers.find(s => s.value === product.supplier_id) || null;
  const currentPresentation = presentationOptions.find(p => p.value === product.presentation) || null;
  const currentTemperature = temperatureOptions.find(t => t.value === product.temperature_range) || null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Text weight="font-semibold" additionalClass="text-gray-800">
          {t("process:product")} {index + 1}
        </Text>
        <Button
          type="button"
          onClick={onRemove}
          additionalClass="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm"
        >
          {t("common:remove")}
        </Button>
      </div>

      {/* ✅ Product Selection and Code Row - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:product")} *
          </label>
          <Select
            options={products}
            value={currentProduct}
            onChange={(selectedOption) => handleSelectChange('product_id', selectedOption)}
            placeholder={t("process:select_product")}
            isDisabled={shouldDisableFields}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:product_code")}
          </label>
          <input
            type="text"
            id={`product_code_${index}`}
            name="product_code"
            value={product.product_code || ""}
            readOnly
            className="h-10 border border-gray-300 rounded px-3 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
            placeholder="Auto-filled when product is selected"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:supplier")} *
          </label>
          <Select
            options={suppliers}
            value={currentSupplier}
            onChange={(selectedOption) => handleSelectChange('supplier_id', selectedOption)}
            placeholder={t("process:select_supplier")}
            isDisabled={shouldDisableFields}
          />
        </div>
      </div>

      {/* Serial and Lot Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:serial_number")} *
          </label>
          <input
            type="text"
            value={product.serial_number}
            onChange={(e) => handleChange('serial_number', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder={t("process:enter_serial_number")}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:lot_series")} *
          </label>
          <input
            type="text"
            value={product.lot_series}
            onChange={(e) => handleChange('lot_series', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder={t("process:enter_lot_series")}
          />
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:inventory_quantity")} *
          </label>
          <input
            type="number"
            value={product.inventory_quantity}
            onChange={(e) => handleChange('inventory_quantity', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0"
            min="1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:package_quantity")} *
          </label>
          <input
            type="number"
            value={product.package_quantity}
            onChange={(e) => handleChange('package_quantity', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0"
            min="1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:weight_kg")} *
          </label>
          <input
            type="number"
            step="0.01"
            value={product.weight_kg}
            onChange={(e) => handleChange('weight_kg', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0.00"
            min="0"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:volume_m3")}
          </label>
          <input
            type="number"
            step="0.001"
            value={product.volume_m3}
            onChange={(e) => handleChange('volume_m3', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0.000"
            min="0"
          />
        </div>
      </div>

      {/* Presentation and Temperature */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:presentation")} *
          </label>
          <Select
            options={presentationOptions}
            value={currentPresentation}
            onChange={(selectedOption) => handleSelectChange('presentation', selectedOption)}
            placeholder={t("process:select_presentation")}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:temperature_range")} *
          </label>
          <Select
            options={temperatureOptions}
            value={currentTemperature}
            onChange={(selectedOption) => handleSelectChange('temperature_range', selectedOption)}
            placeholder={t("process:select_temperature")}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:quantity_pallets")}
          </label>
          <input
            type="number"
            value={product.quantity_pallets}
            onChange={(e) => handleChange('quantity_pallets', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:manufacturing_date")} *
          </label>
          <DatePicker
            selected={product.manufacturing_date}
            onChange={(date) => handleChange('manufacturing_date', date)}
            className="h-10 border border-gray-300 rounded px-3 w-full"
            dateFormat="MM/dd/yyyy"
            maxDate={new Date()}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:expiration_date")} *
          </label>
          <DatePicker
            selected={product.expiration_date}
            onChange={(date) => handleChange('expiration_date', date)}
            className="h-10 border border-gray-300 rounded px-3 w-full"
            dateFormat="MM/dd/yyyy"
            minDate={new Date()}
          />
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            ${t("process:insured_value")}
          </label>
          <input
            type="number"
            step="0.01"
            value={product.insured_value}
            onChange={(e) => handleChange('insured_value', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder="0.00"
            min="0"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t("process:humidity")}
          </label>
          <input
            type="text"
            value={product.humidity}
            onChange={(e) => handleChange('humidity', e.target.value)}
            className="h-10 border border-gray-300 rounded px-3"
            placeholder={t("process:enter_humidity")}
          />
        </div>
      </div>

      {/* Health Registration */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          {t("process:health_registration")}
        </label>
        <input
          type="text"
          value={product.health_registration}
          onChange={(e) => handleChange('health_registration', e.target.value)}
          className="h-10 border border-gray-300 rounded px-3"
          placeholder={t("process:enter_health_registration")}
        />
      </div>
    </div>
  );
};

export default ProductEntryCard;