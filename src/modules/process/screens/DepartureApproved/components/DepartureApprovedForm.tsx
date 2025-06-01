/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { Button, Text, LoaderSync, Divider } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";
import { InventorySelection } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const DepartureApprovedForm: React.FC = () => {
  const { t } = useTranslation(['process']);
  const navigate = useNavigate();
  
  const {
    departureFormFields,
    warehouses,
    productsWithInventory,
    inventorySelections,
    inventoryError,
    submitStatus,
    loaders,
    addInventorySelection,
    removeInventorySelection,
    clearInventorySelections,
    setInventoryError,
  } = ProcessesStore();

  const [formData, setFormData] = useState({
    departure_order_no: "",
    registration_date: new Date(),
    document_no: "",
    document_date: new Date(),
    date_and_time_of_transfer: new Date(),
    arrival_point: "",
    id_responsible: { option: "", value: "", label: "" },
    customer_id: { option: "", value: "", label: "" },
    document_type_id: { option: "", value: "", label: "" },
    warehouse_id: { option: "", value: "", label: "" },
    responsible_for_collection: "",
    order_progress: "",
    observation: "",
    total_volume: "",
    palettes: "",
    insured_value: "",
    product_description: "",
    departure_date: new Date(),
    type: "",
    departure_transfer_note: "",
    personnel_in_charge_id: "",
    packaging_id: "",
    label_id: "",
    document_status: "",
    packaging_list: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [availableCells, setAvailableCells] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoadingProducts = loaders["processes/load-products-inventory"];
  const isLoadingCells = loaders["processes/load-cells"];
  const isLoadingFormFields = loaders["processes/load-form-fields"];

  useEffect(() => {
    ProcessService.loadDepartureFormFields();
    ProcessService.fetchWarehouses();
  }, []);

  useEffect(() => {
    if (formData.warehouse_id.value) {
      ProcessService.loadProductsWithInventory(formData.warehouse_id.value);
      clearInventorySelections();
      setSelectedProduct("");
      setAvailableCells([]);
    }
  }, [formData.warehouse_id.value, clearInventorySelections]);

  useEffect(() => {
    if (selectedProduct && formData.warehouse_id.value) {
      ProcessService.loadAvailableCellsForEntryProduct(selectedProduct, formData.warehouse_id.value)
        .then(cells => setAvailableCells(cells || []))
        .catch(error => console.error("Error loading cells:", error));
    }
  }, [selectedProduct, formData.warehouse_id.value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption || { option: "", value: "", label: "" } }));
  };

  const handleDateChange = (date: Date | null, name: string) => {
    setFormData(prev => ({ ...prev, [name]: date || new Date() }));
  };

  const handleProductSelect = (entryOrderProductId: string) => {
    setSelectedProduct(entryOrderProductId);
  };

  const handleCellSelection = (cell: any, requested_qty: number, requested_weight: number) => {
    if (requested_qty <= 0 || requested_weight <= 0) {
      setInventoryError("Quantities must be greater than 0");
      return;
    }

    if (requested_qty > cell.available_packaging) {
      setInventoryError(`Cannot request more than ${cell.available_packaging} packages from this cell`);
      return;
    }

    if (requested_weight > cell.available_weight) {
      setInventoryError(`Cannot request more than ${cell.available_weight}kg from this cell`);
      return;
    }

    const selection: InventorySelection = {
      inventory_id: cell.inventory_id,
      entry_order_product_id: selectedProduct,
      cell_reference: cell.cell_reference,
      warehouse_name: cell.warehouse_name,
      product_code: cell.product_code,
      product_name: cell.product_name,
      requested_qty,
      requested_weight,
      available_packaging: cell.available_packaging,
      available_weight: cell.available_weight,
      packaging_type: cell.packaging_type,
      packaging_status: cell.packaging_status,
      entry_order_no: cell.entry_order_no,
      expiration_date: cell.expiration_date,
      packaging_code: cell.packaging_code || 37, // Add packaging_code with default
    };

    addInventorySelection(selection);
    setInventoryError("");
  };

  const handleRemoveSelection = (inventoryId: string) => {
    removeInventorySelection(inventoryId);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inventorySelections.length === 0) {
      setInventoryError("Please select at least one inventory item");
      return;
    }

    // Basic frontend validation
    for (const selection of inventorySelections) {
      if (selection.requested_qty <= 0 || selection.requested_weight <= 0) {
        setInventoryError("All requested quantities and weights must be greater than 0");
        return;
      }
      if (selection.requested_qty > selection.available_packaging) {
        setInventoryError(`Cannot request more than ${selection.available_packaging} packages from cell ${selection.cell_reference}`);
        return;
      }
      if (selection.requested_weight > selection.available_weight) {
        setInventoryError(`Cannot request more than ${selection.available_weight}kg from cell ${selection.cell_reference}`);
        return;
      }
    }

    setIsSubmitting(true);
    setInventoryError("");

    try {
      const inventory_selections = inventorySelections.map(selection => ({
        inventory_id: selection.inventory_id,
        requested_qty: selection.requested_qty,
        requested_weight: selection.requested_weight,
        packaging_code: selection.packaging_code || 37, // Include packaging_code
        packaging_type: selection.packaging_type,
        packaging_status: selection.packaging_status,
      }));

      const submissionData = {
        departure_order_no: formData.departure_order_no,
        registration_date: formData.registration_date.toISOString(),
        document_no: formData.document_no,
        document_date: formData.document_date.toISOString(),
        date_and_time_of_transfer: formData.date_and_time_of_transfer.toISOString(),
        arrival_point: formData.arrival_point,
        id_responsible: formData.id_responsible.value,
        customer_id: formData.customer_id.value,
        document_type_id: formData.document_type_id.value,
        warehouse_id: formData.warehouse_id.value,
        departure_date: formData.departure_date.toISOString(),
        responsible_for_collection: formData.responsible_for_collection,
        order_progress: formData.order_progress,
        observation: formData.observation,
        departure_transfer_note: formData.departure_transfer_note,
        packaging_list: formData.packaging_list,
        total_volume: formData.total_volume ? parseFloat(formData.total_volume) : undefined,
        palettes: formData.palettes ? parseInt(formData.palettes) : undefined,
        insured_value: formData.insured_value ? parseFloat(formData.insured_value) : undefined,
        product_description: formData.product_description,
        type: formData.type,
        inventory_selections,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
        order_type: "DEPARTURE",
      };

      console.log("Submitting departure order data:", submissionData);

      await ProcessService.createDepartureOrderWithInventorySelections(submissionData);
      navigate("/processes/departure");
    } catch (error: any) {
      console.error("Submission failed:", error);
      
      // Better error handling
      let errorMessage = "Failed to create departure order. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setInventoryError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductData = useMemo(() => {
    return productsWithInventory.find(p => p.entry_order_product_id === selectedProduct);
  }, [productsWithInventory, selectedProduct]);

  const totalSelectedQty = useMemo(() => {
    return inventorySelections.reduce((sum, selection) => sum + selection.requested_qty, 0);
  }, [inventorySelections]);

  const totalSelectedWeight = useMemo(() => {
    return inventorySelections.reduce((sum, selection) => sum + selection.requested_weight, 0);
  }, [inventorySelections]);

  if (isLoadingFormFields) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderSync loaderText="Loading form..." />
      </div>
    );
  }

  // Format dropdown options to match your codebase pattern
  const customerOptions = departureFormFields.customers?.map((c: any) => ({
    option: c.label,
    value: c.value,
    label: c.label,
  })) || [];

  const warehouseOptions = warehouses.map(w => ({
    option: w.name,
    value: w.warehouse_id,
    label: w.name,
  }));

  const documentTypeOptions = departureFormFields.documentTypes?.map((dt: any) => ({
    option: dt.label,
    value: dt.value,
    label: dt.label,
  })) || [];

  const userOptions = departureFormFields.users?.map((u: any) => ({
    option: u.label,
    value: u.value,
    label: u.label,
  })) || [];

  return (
    <form className="order_entry_form" onSubmit={onSubmit}>
      {/* Departure Order Header Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
          Departure Order Information
        </Text>

        <div className="w-full flex items-center gap-x-6">
          {/* Departure Order No */}
          <div className="w-full flex flex-col">
            <label htmlFor="departure_order_no">
              Departure Order No. *
            </label>
            <input
              type="text"
              id="departure_order_no"
              name="departure_order_no"
              value={formData.departure_order_no}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
              required
            />
          </div>

          {/* Customer */}
          <div className="w-full flex flex-col">
            <label htmlFor="customer">Customer *</label>
            <Select
              options={customerOptions}
              styles={reactSelectStyle}
              inputId="customer"
              name="customer"
              value={formData.customer_id}
              onChange={(selectedOption) => handleSelectChange("customer_id", selectedOption)}
            />
          </div>

          {/* Warehouse */}
          <div className="w-full flex flex-col">
            <label htmlFor="warehouse">Warehouse *</label>
            <Select
              options={warehouseOptions}
              styles={reactSelectStyle}
              inputId="warehouse"
              name="warehouse"
              value={formData.warehouse_id}
              onChange={(selectedOption) => handleSelectChange("warehouse_id", selectedOption)}
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Document Type */}
          <div className="w-full flex flex-col">
            <label htmlFor="document_type">Document Type *</label>
            <Select
              options={documentTypeOptions}
              styles={reactSelectStyle}
              inputId="document_type"
              name="document_type"
              value={formData.document_type_id}
              onChange={(selectedOption) => handleSelectChange("document_type_id", selectedOption)}
            />
          </div>

          {/* Registration Date */}
          <div className="w-full flex flex-col">
            <label htmlFor="registration_date">Registration Date *</label>
            <DatePicker
              showTimeSelect
              dateFormat="Pp"
              className="w-full border border-slate-400 h-10 rounded-md pl-4"
              id="registration_date"
              name="registration_date"
              selected={formData.registration_date}
              onChange={(date) => handleDateChange(date, "registration_date")}
            />
          </div>

          {/* Document Date */}
          <div className="w-full flex flex-col">
            <label htmlFor="document_date">Document Date *</label>
            <DatePicker
              showTimeSelect
              dateFormat="Pp"
              className="w-full border border-slate-400 h-10 rounded-md pl-4"
              id="document_date"
              name="document_date"
              selected={formData.document_date}
              onChange={(date) => handleDateChange(date, "document_date")}
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Document No */}
          <div className="w-full flex flex-col">
            <label htmlFor="document_no">Document No. *</label>
            <input
              type="text"
              id="document_no"
              name="document_no"
              value={formData.document_no}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
              required
            />
          </div>

          {/* Date and Time of Transfer */}
          <div className="w-full flex flex-col">
            <label htmlFor="date_and_time_of_transfer">
              Date and Time of Transfer *
            </label>
            <DatePicker
              showTimeSelect
              dateFormat="Pp"
              className="w-full border border-slate-400 h-10 rounded-md pl-4"
              id="date_and_time_of_transfer"
              name="date_and_time_of_transfer"
              selected={formData.date_and_time_of_transfer}
              onChange={(date) => handleDateChange(date, "date_and_time_of_transfer")}
            />
          </div>

          {/* Arrival Point */}
          <div className="w-full flex flex-col">
            <label htmlFor="arrival_point">Arrival Point *</label>
            <input
              type="text"
              id="arrival_point"
              name="arrival_point"
              value={formData.arrival_point}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
              required
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Responsible Person */}
          <div className="w-full flex flex-col">
            <label htmlFor="id_responsible">Responsible Person *</label>
            <Select
              options={userOptions}
              styles={reactSelectStyle}
              inputId="id_responsible"
              name="id_responsible"
              value={formData.id_responsible}
              onChange={(selectedOption) => handleSelectChange("id_responsible", selectedOption)}
            />
          </div>

          {/* Departure Date */}
          <div className="w-full flex flex-col">
            <label htmlFor="departure_date">Departure Date</label>
            <DatePicker
              showTimeSelect
              dateFormat="Pp"
              className="w-full border border-slate-400 h-10 rounded-md pl-4"
              id="departure_date"
              name="departure_date"
              selected={formData.departure_date}
              onChange={(date) => handleDateChange(date, "departure_date")}
            />
          </div>

          {/* Total Volume */}
          <div className="w-full flex flex-col">
            <label htmlFor="total_volume">Total Volume (m³)</label>
            <input
              type="number"
              step="0.01"
              id="total_volume"
              name="total_volume"
              value={formData.total_volume}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Palettes */}
          <div className="w-full flex flex-col">
            <label htmlFor="palettes">Palettes</label>
            <input
              type="number"
              id="palettes"
              name="palettes"
              value={formData.palettes}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            />
          </div>

          {/* Insured Value */}
          <div className="w-full flex flex-col">
            <label htmlFor="insured_value">Insured Value</label>
            <input
              type="number"
              step="0.01"
              id="insured_value"
              name="insured_value"
              value={formData.insured_value}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            />
          </div>

          {/* Type */}
          <div className="w-full flex flex-col">
            <label htmlFor="type">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            />
          </div>
        </div>

        <Divider />

        {/* Additional Information */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="product_description">Product Description</label>
            <textarea
              id="product_description"
              name="product_description"
              value={formData.product_description}
              onChange={handleInputChange}
              rows={3}
              className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-primary-500"
            />
          </div>
          <div className="w-full flex flex-col">
            <label htmlFor="observation">Observation</label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleInputChange}
              rows={3}
              className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      {formData.warehouse_id.value && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
            Select Products ({productsWithInventory.length} available)
          </Text>
          
          {isLoadingProducts ? (
            <div className="flex justify-center py-4">
              <LoaderSync loaderText="Loading products..." />
            </div>
          ) : productsWithInventory.length === 0 ? (
            <Text additionalClass="text-gray-500">
              No products with inventory available in this warehouse
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
              {productsWithInventory.map((product) => (
                <div
                  key={product.entry_order_product_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                    selectedProduct === product.entry_order_product_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProductSelect(product.entry_order_product_id)}
                >
                  <div className="space-y-2">
                    <Text weight="font-semibold" additionalClass="text-gray-800">
                      {product.product_name}
                    </Text>
                    <Text size="sm" additionalClass="text-gray-600">
                      Code: {product.product_code}
                    </Text>
                    <Text size="sm" additionalClass="text-gray-600">
                      Entry Order: {product.entry_order_no}
                    </Text>
                    <Text size="sm" additionalClass="text-gray-600">
                      Supplier: {product.supplier_name}
                    </Text>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available:</span>
                        <span className="font-medium">{product.total_packaging} pkg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Weight:</span>
                        <span className="font-medium">{product.total_weight?.toFixed(2) || 0} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Locations:</span>
                        <span className="font-medium">{product.location_count} cells</span>
                      </div>
                    </div>
                    
                    {product.expiration_date && (
                      <Text size="xs" additionalClass="text-orange-600">
                        Expires: {new Date(product.expiration_date).toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cell Selection Section */}
      {selectedProduct && selectedProductData && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
            Select Cells for {selectedProductData.product_name}
          </Text>
          
          {isLoadingCells ? (
            <div className="flex justify-center py-4">
              <LoaderSync loaderText="Loading available cells..." />
            </div>
          ) : availableCells.length === 0 ? (
            <Text additionalClass="text-gray-500">
              No available cells for this product in the selected warehouse
            </Text>
          ) : (
            <div className="space-y-4">
              {availableCells.map((cell) => (
                <CellSelectionRow
                  key={cell.inventory_id}
                  cell={cell}
                  onSelect={handleCellSelection}
                  disabled={inventorySelections.some(s => s.inventory_id === cell.inventory_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Inventory Summary */}
      {inventorySelections.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
            Selected Inventory Summary
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded border">
              <Text size="xl" weight="font-bold" additionalClass="text-blue-600">
                {totalSelectedQty}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">Total Packages</Text>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <Text size="xl" weight="font-bold" additionalClass="text-green-600">
                {totalSelectedWeight.toFixed(2)}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">Total Weight (kg)</Text>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <Text size="xl" weight="font-bold" additionalClass="text-purple-600">
                {inventorySelections.length}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">Cells Selected</Text>
            </div>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {inventorySelections.map((selection) => (
              <div key={selection.inventory_id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex-1">
                  <Text weight="font-medium">
                    {selection.product_name} - Cell {selection.cell_reference}
                  </Text>
                  <Text size="sm" additionalClass="text-gray-600">
                    {selection.requested_qty} packages ({selection.requested_weight}kg) from {selection.entry_order_no}
                  </Text>
                </div>
                <Button
                  type="button"
                  variant="cancel"
                  size="sm"
                  onClick={() => handleRemoveSelection(selection.inventory_id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error and Status Messages */}
      {inventoryError && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <Text>{inventoryError}</Text>
        </div>
      )}

      {submitStatus.message && (
        <div className={`p-4 rounded-lg mb-4 ${
          submitStatus.success 
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          <Text>{submitStatus.message}</Text>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="cancel"
          onClick={() => navigate(-1)}
          additionalClass="px-6 py-2"
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          disabled={inventorySelections.length === 0 || isSubmitting}
          variant="action"
          additionalClass="w-40"
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create Departure Order"}
        </Button>
      </div>
    </form>
  );
};

// Cell Selection Row Component
interface CellSelectionRowProps {
  cell: any;
  onSelect: (cell: any, qty: number, weight: number) => void;
  disabled: boolean;
}

const CellSelectionRow: React.FC<CellSelectionRowProps> = ({ cell, onSelect, disabled }) => {
  const [requestedQty, setRequestedQty] = useState<string>("");
  const [requestedWeight, setRequestedWeight] = useState<string>("");

  const handleSelect = () => {
    const qty = parseInt(requestedQty);
    const weight = parseFloat(requestedWeight);
    
    if (qty > 0 && weight > 0) {
      onSelect(cell, qty, weight);
      setRequestedQty("");
      setRequestedWeight("");
    }
  };

  return (
    <div className={`border rounded-lg p-4 bg-white ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
        <div className="md:col-span-2">
          <Text weight="font-medium">Cell {cell.cell_reference}</Text>
          <Text size="sm" additionalClass="text-gray-600">
            {cell.warehouse_name}
          </Text>
          <Text size="sm" additionalClass="text-gray-600">
            Order: {cell.entry_order_no}
          </Text>
        </div>
        
        <div>
          <Text size="sm" additionalClass="text-gray-500">Available</Text>
          <Text weight="font-medium">{cell.available_packaging} pkg</Text>
          <Text size="sm">{cell.available_weight?.toFixed(2) || 0} kg</Text>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Request Qty</label>
          <input
            type="number"
            value={requestedQty}
            onChange={(e) => setRequestedQty(e.target.value)}
            max={cell.available_packaging}
            min="1"
            className="w-full h-8 border border-slate-400 rounded px-2 text-sm focus-visible:outline-primary-500"
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Request Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            value={requestedWeight}
            onChange={(e) => setRequestedWeight(e.target.value)}
            max={cell.available_weight}
            min="0.01"
            className="w-full h-8 border border-slate-400 rounded px-2 text-sm focus-visible:outline-primary-500"
            disabled={disabled}
          />
        </div>
        
        <div>
          <Button
            type="button"
            variant="action"
            size="sm"
            onClick={handleSelect}
            disabled={disabled || !requestedQty || !requestedWeight}
            additionalClass="w-full"
          >
            {disabled ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartureApprovedForm;