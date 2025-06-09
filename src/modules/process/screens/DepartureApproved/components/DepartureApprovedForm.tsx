/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { Button, Text, LoaderSync, Divider } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface EntryOrderOption {
  value: string;
  label: string;
  option: string;
  entry_order_id: string;
  entry_order_no: string;
  customer_name: string;
  entry_date: string;
  products_count: number;
  total_quantity: number;
  total_weight: number;
}

interface ProductFromEntryOrder {
  allocation_id: string;
  inventory_id: string;
  entry_order_product_id: string;
  entry_order_no: string;
  product_code: string;
  product_name: string;
  lot_number: string;
  quantity_inventory_units: number;
  packaging_quantity: number;
  packaging_type: string;
  cell_position: string;
  entry_date_time: string;
  manufacturer: string;
  product_line: string;
  group_name: string;
  supplier_name: string;
  available_weight: number;
  available_volume: number;
  quality_status: string;
  product_status: string;
  warehouse_name: string;
  warehouse_location: string;
  guide_number: string;
  observations: string;
  manufacturing_date: string;
  expiration_date: string;
  registration_date: string;
  document_date: string;
  can_depart: boolean;
  max_selectable_quantity: number;
  max_selectable_packages: number;
  max_selectable_weight: number;
}

interface SelectedProduct {
  allocation_id: string;
  inventory_id: string;
  entry_order_product_id: string;
  product_name: string;
  product_code: string;
  lot_number: string;
  requested_qty: number;
  requested_weight: number;
  max_selectable_quantity: number;
  max_selectable_packages: number;
  max_selectable_weight: number;
  cell_position: string;
  packaging_type: string;
}

const DepartureApprovedForm: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const navigate = useNavigate();
  
  const {
    departureFormFields,
    warehouses,
    loaders,
  } = ProcessesStore();

  // Form state
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [selectedEntryOrder, setSelectedEntryOrder] = useState<EntryOrderOption | null>(null);
  const [availableEntryOrders, setAvailableEntryOrders] = useState<EntryOrderOption[]>([]);
  const [entryOrderProducts, setEntryOrderProducts] = useState<ProductFromEntryOrder[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Departure order form data
  const [formData, setFormData] = useState({
    departure_order_no: "",
    customer_id: { option: "", value: "", label: "" },
    document_type_id: { option: "", value: "", label: "" },
    document_no: "",
    document_date: new Date(),
    departure_date: new Date(),
    responsible_person_id: { option: "", value: "", label: "" },
    arrival_point: "",
    observations: "",
    transport_type: "",
    total_volume: "",
    insured_value: "",
  });

  // Load initial data
  useEffect(() => {
    ProcessService.loadDepartureFormFields();
    ProcessService.fetchWarehouses();
    
    // Auto-generate departure order number
    ProcessService.getCurrentDepartureOrderNo()
      .then(orderNo => {
        setFormData(prev => ({ ...prev, departure_order_no: orderNo }));
      })
      .catch(console.error);
  }, []);

  // Load entry orders when warehouse is selected
  useEffect(() => {
    if (selectedWarehouse?.value) {
      setError("");
      ProcessService.getEntryOrdersForDeparture(selectedWarehouse.value)
        .then((entryOrders) => {
          const formattedOrders = entryOrders.map((order: any) => ({
            value: order.entry_order_id,
            label: `${order.entry_order_no}${order.customer_name ? ` - ${order.customer_name}` : ''}`,
            option: order.entry_order_no,
            entry_order_id: order.entry_order_id,
            entry_order_no: order.entry_order_no,
            customer_name: order.customer_name || '',
            entry_date: order.entry_date || '',
            products_count: order.products_count || 0,
            total_quantity: order.total_quantity || 0,
            total_weight: order.total_weight || 0,
          }));
          setAvailableEntryOrders(formattedOrders);
          
          // Reset selections
          setSelectedEntryOrder(null);
          setEntryOrderProducts([]);
          setSelectedProducts([]);
        })
        .catch((error) => {
          console.error("Failed to load entry orders:", error);
          setError("Failed to load entry orders for selected warehouse");
          setAvailableEntryOrders([]);
        });
    } else {
      setAvailableEntryOrders([]);
      setSelectedEntryOrder(null);
      setEntryOrderProducts([]);
    }
  }, [selectedWarehouse]);

  // Load products when entry order is selected
  useEffect(() => {
    if (selectedEntryOrder?.entry_order_id && selectedWarehouse?.value) {
      setError("");
      ProcessService.getProductsByEntryOrder(selectedEntryOrder.entry_order_id, selectedWarehouse.value)
        .then((products) => {
          setEntryOrderProducts(products);
          setSelectedProducts([]);
        })
        .catch((error) => {
          console.error("Failed to load products:", error);
          setError("Failed to load products for selected entry order");
          setEntryOrderProducts([]);
        });
    } else {
      setEntryOrderProducts([]);
      setSelectedProducts([]);
    }
  }, [selectedEntryOrder, selectedWarehouse]);

  const handleWarehouseChange = (selectedOption: any) => {
    setSelectedWarehouse(selectedOption);
  };

  const handleEntryOrderChange = (selectedOption: any) => {
    setSelectedEntryOrder(selectedOption);
  };

  const handleProductSelect = (product: ProductFromEntryOrder, isSelected: boolean) => {
    if (isSelected) {
      // Add product to selection with default quantities
      const selectedProduct: SelectedProduct = {
        allocation_id: product.allocation_id,
        inventory_id: product.inventory_id,
        entry_order_product_id: product.entry_order_product_id,
        product_name: product.product_name,
        product_code: product.product_code,
        lot_number: product.lot_number,
        requested_qty: 1,
        requested_weight: 1,
        max_selectable_quantity: product.max_selectable_quantity,
        max_selectable_packages: product.max_selectable_packages,
        max_selectable_weight: product.max_selectable_weight,
        cell_position: product.cell_position,
        packaging_type: product.packaging_type,
      };
      setSelectedProducts(prev => [...prev, selectedProduct]);
    } else {
      // Remove product from selection
      setSelectedProducts(prev => prev.filter(p => p.allocation_id !== product.allocation_id));
    }
  };

  const handleQuantityChange = (allocationId: string, field: 'requested_qty' | 'requested_weight', value: string) => {
    const numValue = field === 'requested_qty' ? parseInt(value) || 0 : parseFloat(value) || 0;
    
    setSelectedProducts(prev => prev.map(product => 
      product.allocation_id === allocationId 
        ? { ...product, [field]: numValue }
        : product
    ));
  };

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

  const validateQuantities = () => {
    for (const product of selectedProducts) {
      if (product.requested_qty <= 0 || product.requested_weight <= 0) {
        return `Please enter valid quantities for ${product.product_name}`;
      }
      if (product.requested_qty > product.max_selectable_quantity) {
        return `Requested quantity for ${product.product_name} exceeds available quantity (${product.max_selectable_quantity})`;
      }
      if (product.requested_weight > product.max_selectable_weight) {
        return `Requested weight for ${product.product_name} exceeds available weight (${product.max_selectable_weight} kg)`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntryOrder) {
      setError("Please select an entry order");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    const validationError = validateQuantities();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const inventory_selections = selectedProducts.map(product => ({
        allocation_id: product.allocation_id,
        inventory_id: product.inventory_id,
        entry_order_product_id: product.entry_order_product_id,
        requested_qty: product.requested_qty,
        requested_weight: product.requested_weight,
      }));

      const submissionData = {
        departure_order_no: formData.departure_order_no,
        customer_id: formData.customer_id.value,
        warehouse_id: selectedWarehouse.value,
        document_type_id: formData.document_type_id.value,
        document_number: formData.document_no,
        document_date: formData.document_date.toISOString(),
        departure_date: formData.departure_date.toISOString(),
        arrival_point: formData.arrival_point,
        observations: formData.observations,
        inventory_selections,
      };

      await ProcessService.createDepartureOrderWithInventorySelections(submissionData);
      navigate("/processes/departure");
    } catch (error: any) {
      console.error("Failed to create departure order:", error);
      setError(error.message || "Failed to create departure order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelectedProducts = selectedProducts.length;
  const totalRequestedQty = selectedProducts.reduce((sum, product) => sum + product.requested_qty, 0);
  const totalRequestedWeight = selectedProducts.reduce((sum, product) => sum + product.requested_weight, 0);

  const isLoadingEntryOrders = loaders["processes/fetch-entry-orders-for-departure"];
  const isLoadingProducts = loaders["processes/fetch-products-by-entry-order"];
  const isLoadingFormFields = loaders["processes/load-departure-form-fields"];

  // Helper function to safely parse dates
  const parseDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  if (isLoadingFormFields) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderSync loaderText={t('common:loading')} />
      </div>
    );
  }

  // Format dropdown options
  const warehouseOptions = warehouses.map(w => ({
    option: w.name,
    value: w.warehouse_id,
    label: w.name,
  }));

  const customerOptions = departureFormFields.customers?.map((c: any) => ({
    option: c.label,
    value: c.value,
    label: c.label,
  })) || [];

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
    <form className="order_entry_form" onSubmit={handleSubmit}>
      {/* Departure Order Header Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
          {t('process:departure_information')}
        </Text>

        <div className="w-full flex items-center gap-x-6">
          {/* Departure Order No */}
          <div className="w-full flex flex-col">
            <label htmlFor="departure_order_no">
              {t('process:departure_order_no')} *
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
            <label htmlFor="customer">{t('process:customer')} *</label>
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
            <label htmlFor="warehouse">{t('process:warehouse')} *</label>
            <Select
              options={warehouseOptions}
              styles={reactSelectStyle}
              inputId="warehouse"
              name="warehouse"
              value={selectedWarehouse}
              onChange={handleWarehouseChange}
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Entry Order */}
          <div className="w-full flex flex-col">
            <label htmlFor="entry_order">Entry Order *</label>
            {isLoadingEntryOrders ? (
              <div className="h-10 flex items-center justify-center border border-slate-400 rounded-md">
                <LoaderSync loaderText="Loading..." />
              </div>
            ) : (
              <Select
                options={availableEntryOrders}
                styles={reactSelectStyle}
                inputId="entry_order"
                name="entry_order"
                value={selectedEntryOrder}
                onChange={handleEntryOrderChange}
                placeholder={selectedWarehouse ? "Select entry order..." : "Select warehouse first"}
                isDisabled={!selectedWarehouse || availableEntryOrders.length === 0}
              />
            )}
          </div>

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
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* Document Date */}
          <div className="w-full flex flex-col">
            <label htmlFor="document_date">Document Date *</label>
            <DatePicker
              dateFormat="Pp"
              className="w-full border border-slate-400 h-10 rounded-md pl-4"
              id="document_date"
              name="document_date"
              selected={formData.document_date}
              onChange={(date) => handleDateChange(date, "document_date")}
            />
          </div>

          {/* Departure Date */}
          <div className="w-full flex flex-col">
            <label htmlFor="departure_date">Departure Date *</label>
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

          {/* Arrival Point */}
          <div className="w-full flex flex-col">
            <label htmlFor="arrival_point">Arrival Point</label>
            <input
              type="text"
              id="arrival_point"
              name="arrival_point"
              value={formData.arrival_point}
              onChange={handleInputChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
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

          {/* Spacer for alignment */}
          <div className="w-full"></div>
        </div>

        <Divider />

        {/* Observations */}
        <div className="w-full flex flex-col">
          <label htmlFor="observations">Observations</label>
          <textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleInputChange}
            rows={3}
            className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      {/* Selected Entry Order Summary */}
      {selectedEntryOrder && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-2 text-blue-800">
            Selected Entry Order: {selectedEntryOrder.entry_order_no}
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Customer:</span>
              <div className="font-medium">{selectedEntryOrder.customer_name || 'N/A'}</div>
            </div>
            <div>
              <span className="text-blue-600">Entry Date:</span>
              <div className="font-medium">{parseDate(selectedEntryOrder.entry_date)}</div>
            </div>
            <div>
              <span className="text-blue-600">Available Products:</span>
              <div className="font-medium">{entryOrderProducts.length}</div>
            </div>
            <div>
              <span className="text-blue-600">Total Weight:</span>
              <div className="font-medium">{selectedEntryOrder.total_weight?.toFixed(2)} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Section */}
      {selectedEntryOrder && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
            Select Products for Departure ({entryOrderProducts.length} available)
          </Text>
          
          {isLoadingProducts ? (
            <div className="flex justify-center py-4">
              <LoaderSync loaderText="Loading products..." />
            </div>
          ) : entryOrderProducts.length === 0 ? (
            <Text additionalClass="text-gray-500">
              No products available for this entry order
            </Text>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-center">Select</th>
                      <th className="border border-gray-300 p-2 text-left">Product</th>
                      <th className="border border-gray-300 p-2 text-left">LOT Number</th>
                      <th className="border border-gray-300 p-2 text-center">Available</th>
                      <th className="border border-gray-300 p-2 text-center">Request Qty</th>
                      <th className="border border-gray-300 p-2 text-center">Request Weight</th>
                      <th className="border border-gray-300 p-2 text-left">Cell Position</th>
                      <th className="border border-gray-300 p-2 text-left">Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entryOrderProducts.map((product) => {
                      const isSelected = selectedProducts.some(p => p.allocation_id === product.allocation_id);
                      return (
                        <tr key={product.allocation_id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleProductSelect(product, e.target.checked)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>
                              <div className="font-medium">{product.product_name || 'N/A'}</div>
                              <div className="text-sm text-gray-600">{product.product_code || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{product.supplier_name || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>{product.lot_number || 'N/A'}</div>
                            <div className="text-xs text-gray-500">
                              Quality: {product.quality_status || 'N/A'}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <div className="font-medium">{product.max_selectable_quantity || 0} units</div>
                            <div className="text-sm text-gray-600">{product.max_selectable_packages || 0} pkg</div>
                            <div className="text-sm text-gray-600">{product.max_selectable_weight?.toFixed(2) || '0.00'} kg</div>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {isSelected ? (
                              <input
                                type="number"
                                min="1"
                                max={product.max_selectable_quantity}
                                value={selectedProducts.find(p => p.allocation_id === product.allocation_id)?.requested_qty || 1}
                                onChange={(e) => handleQuantityChange(product.allocation_id, 'requested_qty', e.target.value)}
                                className="w-16 h-8 border border-gray-300 rounded px-2 text-center"
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {isSelected ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={product.max_selectable_weight}
                                value={selectedProducts.find(p => p.allocation_id === product.allocation_id)?.requested_weight || 1}
                                onChange={(e) => handleQuantityChange(product.allocation_id, 'requested_weight', e.target.value)}
                                className="w-20 h-8 border border-gray-300 rounded px-2 text-center"
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="text-sm font-medium">{product.cell_position || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{product.packaging_type || 'N/A'}</div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="text-xs">
                              <div>Mfg: {parseDate(product.manufacturing_date)}</div>
                              <div>Exp: {parseDate(product.expiration_date)}</div>
                              <div>Entry: {parseDate(product.entry_date_time)}</div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-white p-4 rounded border mb-6">
          <Text weight="font-semibold" additionalClass="mb-2">Selection Summary</Text>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{totalSelectedProducts}</div>
              <div className="text-gray-600">Products Selected</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{totalRequestedQty}</div>
              <div className="text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{totalRequestedWeight.toFixed(2)}</div>
              <div className="text-gray-600">Total Weight (kg)</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <Text>{error}</Text>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="cancel"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="action"
          disabled={!selectedEntryOrder || selectedProducts.length === 0 || isSubmitting}
          additionalClass="w-48"
        >
          {isSubmitting ? "Creating..." : "Create Departure Order"}
        </Button>
      </div>
    </form>
  );
};

export default DepartureApprovedForm; 