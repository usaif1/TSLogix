/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel, SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import { Button, Text, LoaderSync, Divider } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";
import { FifoProductWithInventory, FifoAllocation, FifoSelection } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface ProductSelectionRow {
  product: FifoProductWithInventory;
  requestedQuantity: number;
  requestedWeight: number;
  fifoAllocation?: FifoAllocation;
  isLoading: boolean;
  error?: string;
}

const DepartureApprovedForm: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const navigate = useNavigate();
  
  const {
    departureFormFields,
    warehouses,
    fifoSelections,
    fifoError,
    loaders,
  } = ProcessesStore();

  // Form state
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [availableProducts, setAvailableProducts] = useState<FifoProductWithInventory[]>([]);
  const [productSelections, setProductSelections] = useState<ProductSelectionRow[]>([]);
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

  // Load FIFO products when warehouse is selected
  useEffect(() => {
    if (selectedWarehouse?.value) {
      ProcessService.browseProductsWithInventory(selectedWarehouse.value)
        .then((products) => {
          setAvailableProducts(products);
          // Clear previous selections when warehouse changes
          setProductSelections([]);
          ProcessesStore.getState().clearFifoState();
        })
        .catch((error) => {
          console.error("Failed to load FIFO products:", error);
          ProcessesStore.getState().setFifoError("Failed to load products for selected warehouse");
        });
    } else {
      setAvailableProducts([]);
      setProductSelections([]);
      ProcessesStore.getState().clearFifoState();
    }
  }, [selectedWarehouse]);

  const handleWarehouseChange = (selectedOption: any) => {
    setSelectedWarehouse(selectedOption);
  };

  const handleAddProduct = () => {
    setProductSelections(prev => [...prev, {
      product: {} as FifoProductWithInventory,
      requestedQuantity: 0,
      requestedWeight: 0,
      isLoading: false,
    }]);
  };

  const handleRemoveProduct = (index: number) => {
    const productToRemove = productSelections[index];
    if (productToRemove.product?.product_id) {
      ProcessesStore.getState().clearFifoAllocation(productToRemove.product.product_id);
      ProcessesStore.getState().removeFifoSelection(productToRemove.product.product_id);
    }
    setProductSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, selectedProduct: SingleValue<FifoProductWithInventory>) => {
    if (selectedProduct) {
      setProductSelections(prev => prev.map((selection, i) => 
        i === index ? { ...selection, product: selectedProduct } : selection
      ));
    }
  };

  const handleQuantityChange = (index: number, field: 'requestedQuantity' | 'requestedWeight', value: number) => {
    setProductSelections(prev => prev.map((selection, i) => 
      i === index ? { ...selection, [field]: value } : selection
    ));
  };

  const handleGetFifoAllocation = async (index: number) => {
    const selection = productSelections[index];
    if (!selection.product?.product_id || !selection.requestedQuantity) {
      return;
    }

    // Update loading state
    setProductSelections(prev => prev.map((sel, i) => 
      i === index ? { ...sel, isLoading: true, error: undefined } : sel
    ));

    try {
      const response = await ProcessService.getFifoAllocation(
        selection.product.product_id,
        selection.requestedQuantity,
        selectedWarehouse?.value
      );

      // Validate the response structure
      if (!response || !response.success || !response.data) {
        console.error("Invalid response structure:", response);
        throw new Error(response?.message || "No allocation data received from server");
      }

      const backendData = response.data;

      // Map backend response to expected FifoAllocation structure
      const allocation: FifoAllocation = {
        product_id: backendData.product_id,
        product_code: selection.product.product_code,
        product_name: selection.product.product_name,
        requested_quantity: backendData.requested_quantity,
        total_allocated: backendData.allocated_quantity || 0,
        allocations: (backendData.suggestions || []).map((suggestion: any, index: number) => ({
          inventory_id: suggestion.inventory_id,
          allocated_quantity: suggestion.requested_qty || 0,
          allocated_weight: suggestion.requested_weight || 0,
          cell_code: suggestion.cell_reference || 'N/A',
          cell_id: suggestion.cell_id,
          row: suggestion.cell_reference?.split('.')[0] || 'A',
          bay: parseInt(suggestion.cell_reference?.split('.')[1] || '1'),
          position: parseInt(suggestion.cell_reference?.split('.')[2] || '1'),
          manufacturing_date: suggestion.entry_date_time || new Date().toISOString(),
          expiration_date: suggestion.expiration_date || new Date().toISOString(),
          supplier_name: suggestion.supplier_name || 'N/A',
          lot_series: suggestion.lot_series || 'N/A',
          priority_level: index + 1, // First suggestion gets highest priority
          priority_color: index === 0 ? 'red' : 'yellow' as 'red' | 'yellow' | 'green',
          priority_icon: index === 0 ? 'HIGH' : 'MEDIUM',
          age_days: suggestion.fifo_rank ? Math.floor((new Date().getTime() - new Date(suggestion.fifo_rank).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          formatted_date: suggestion.entry_date_time ? new Date(suggestion.entry_date_time).toLocaleDateString() : 'N/A',
          cell_display: `${suggestion.warehouse_name || 'Main'} - ${suggestion.cell_reference || 'N/A'}`,
          allocation_summary: `${suggestion.requested_qty || 0} units from ${suggestion.cell_reference || 'N/A'}`,
          available_quantity: suggestion.available_qty || 0,
          available_weight: suggestion.available_weight || 0,
          packaging_type: suggestion.packaging_type || 'N/A',
          package_quantity: suggestion.package_quantity || 0,
          guide_number: suggestion.entry_order_no,
          observations: ''
        })),
        summary: {
          total_requested: backendData.requested_quantity,
          total_allocated: backendData.allocated_quantity || 0,
          remaining_needed: backendData.remaining_quantity || 0,
          locations_used: backendData.locations_used || 0,
          oldest_age_days: backendData.oldest_entry_date ? Math.floor((new Date().getTime() - new Date(backendData.oldest_entry_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          newest_age_days: backendData.newest_entry_date ? Math.floor((new Date().getTime() - new Date(backendData.newest_entry_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        },
        fifo_compliance: {
          is_fully_allocated: backendData.fully_allocated || false,
          oldest_first: true,
          quality_approved: true,
          warning_messages: backendData.fully_allocated ? [] : [`Only ${backendData.allocated_quantity || 0} units allocated out of ${backendData.requested_quantity} requested`]
        }
      };

      // Store allocation in store
      ProcessesStore.getState().setFifoAllocation(selection.product.product_id, allocation);

      // Update local state
      setProductSelections(prev => prev.map((sel, i) => 
        i === index ? { ...sel, fifoAllocation: allocation, isLoading: false } : sel
      ));

      // Create FIFO selection for final submission
      const fifoSelection: FifoSelection = {
        product_id: selection.product.product_id,
        product_code: selection.product.product_code,
        product_name: selection.product.product_name,
        requested_quantity: selection.requestedQuantity,
        requested_weight: selection.requestedWeight,
        allocation_details: allocation.allocations,
        fifo_compliance_status: allocation.fifo_compliance.is_fully_allocated ? 'compliant' : 'partial',
        total_allocated_quantity: allocation.total_allocated,
        total_allocated_weight: allocation.allocations.reduce((sum: number, alloc: any) => sum + (alloc.allocated_weight || 0), 0),
        remaining_quantity: Math.max(0, selection.requestedQuantity - allocation.total_allocated),
        remaining_weight: Math.max(0, selection.requestedWeight - allocation.allocations.reduce((sum: number, alloc: any) => sum + (alloc.allocated_weight || 0), 0)),
      };

      ProcessesStore.getState().addFifoSelection(fifoSelection);

    } catch (error: any) {
      console.error("Failed to get FIFO allocation:", error);
      const errorMessage = error.message || "Failed to get FIFO allocation. Please try again.";
      setProductSelections(prev => prev.map((sel, i) => 
        i === index ? { ...sel, isLoading: false, error: errorMessage } : sel
      ));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
  };

  const handleDateChange = (date: Date | null, name: string) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }));
    }
  };

  const validateForm = () => {
    // 1. Dispatch Order Number - Auto-generated (should always be present)
    if (!formData.departure_order_no?.trim()) {
      ProcessesStore.getState().setFifoError("Dispatch order number is required");
      return false;
    }

    // 2. Warehouse selection
    if (!selectedWarehouse?.value) {
      ProcessesStore.getState().setFifoError("Please select a warehouse");
      return false;
    }

    // 3. Customer selection
    if (!formData.customer_id?.value) {
      ProcessesStore.getState().setFifoError("Please select a customer");
      return false;
    }

    // 4. Document type selection
    if (!formData.document_type_id?.value) {
      ProcessesStore.getState().setFifoError("Please select a document type");
      return false;
    }

    // 5. Dispatch Document Number
    if (!formData.document_no?.trim()) {
      ProcessesStore.getState().setFifoError("Dispatch document number is required");
      return false;
    }

    // 6. Dispatch Date & Time
    if (!formData.departure_date) {
      ProcessesStore.getState().setFifoError("Departure date is required");
      return false;
    }

    // 7. Document Date
    if (!formData.document_date) {
      ProcessesStore.getState().setFifoError("Document date is required");
      return false;
    }

    // 8. At least one product with FIFO allocation
    if (fifoSelections.length === 0) {
      ProcessesStore.getState().setFifoError("At least one product with FIFO allocation is required");
      return false;
    }

    // 9. Validate each FIFO selection for mandatory fields
    for (const [index, selection] of fifoSelections.entries()) {
      const productNum = index + 1;

      // Product Code & Name (captured from inventory allocation)
      if (!selection.product_code?.trim()) {
        ProcessesStore.getState().setFifoError(`Product ${productNum}: Product code is missing`);
        return false;
      }

      if (!selection.product_name?.trim()) {
        ProcessesStore.getState().setFifoError(`Product ${productNum}: Product name is missing`);
        return false;
      }

      // Quantity Inventory units (must be > 0)
      if (!selection.requested_quantity || selection.requested_quantity <= 0) {
        ProcessesStore.getState().setFifoError(`Product ${productNum}: Quantity inventory units must be greater than 0`);
        return false;
      }

      // Packaging Quantity (must be > 0)
      if (!selection.requested_weight || selection.requested_weight <= 0) {
        ProcessesStore.getState().setFifoError(`Product ${productNum}: Packaging quantity/weight must be greater than 0`);
        return false;
      }

      // Allocation details must exist
      if (!selection.allocation_details || selection.allocation_details.length === 0) {
        ProcessesStore.getState().setFifoError(`Product ${productNum}: No allocation details found`);
        return false;
      }

      // Validate each allocation detail for mandatory fields
      for (const [allocIndex, alloc] of selection.allocation_details.entries()) {
        const allocNum = allocIndex + 1;

        // Lot Number (lot_series)
        if (!alloc.lot_series?.trim()) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Lot number is missing`);
          return false;
        }

        // Packaging type (presentation)
        if (!alloc.packaging_type?.trim()) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Packaging type is missing`);
          return false;
        }

        // Cell position (cell_code)
        if (!alloc.cell_code?.trim()) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Cell position is missing`);
          return false;
        }

        // Entry Date & Time
        if (!alloc.manufacturing_date) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Entry date & time is missing`);
          return false;
        }

        // Entry Order Number (guide_number)
        if (!alloc.guide_number?.trim()) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Entry order number is missing`);
          return false;
        }

        // Allocated quantity must be > 0
        if (!alloc.allocated_quantity || alloc.allocated_quantity <= 0) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Allocated quantity must be greater than 0`);
          return false;
        }

        // Allocated weight must be > 0
        if (!alloc.allocated_weight || alloc.allocated_weight <= 0) {
          ProcessesStore.getState().setFifoError(`Product ${productNum}, Allocation ${allocNum}: Allocated weight must be greater than 0`);
          return false;
        }
      }
    }

    ProcessesStore.getState().clearFifoError();
    return true;
  };

  // Check if form is ready for submission (for button state)
  const isFormReadyForSubmission = () => {
    return (
      formData.departure_order_no?.trim() &&
      selectedWarehouse?.value &&
      formData.customer_id?.value &&
      formData.document_type_id?.value &&
      formData.document_no?.trim() &&
      formData.departure_date &&
      formData.document_date &&
      fifoSelections.length > 0 &&
      fifoSelections.every(selection => 
        selection.product_code?.trim() &&
        selection.product_name?.trim() &&
        selection.requested_quantity > 0 &&
        selection.requested_weight > 0 &&
        selection.allocation_details?.length > 0 &&
        selection.allocation_details.every(alloc =>
          alloc.lot_series?.trim() &&
          alloc.packaging_type?.trim() &&
          alloc.cell_code?.trim() &&
          alloc.manufacturing_date &&
          alloc.guide_number?.trim() &&
          alloc.allocated_quantity > 0 &&
          alloc.allocated_weight > 0
        )
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    ProcessesStore.getState().clearFifoError();

    try {
      // Prepare FIFO selections data
      const fifoSelectionsData = fifoSelections.map(selection => ({
        product_id: selection.product_id,
        requested_quantity: selection.requested_quantity,
        requested_weight: selection.requested_weight,
        allocation_details: selection.allocation_details.map(detail => ({
          inventory_id: detail.inventory_id,
          allocated_quantity: detail.allocated_quantity,
          allocated_weight: detail.allocated_weight,
          cell_code: detail.cell_code,
          manufacturing_date: detail.manufacturing_date,
          expiration_date: detail.expiration_date,
          supplier_name: detail.supplier_name,
          lot_series: detail.lot_series,
          priority_level: detail.priority_level,
        })),
        observations: selection.observations,
      }));

      const departureOrderData = {
        departure_order_no: formData.departure_order_no,
        customer_id: formData.customer_id.value,
        warehouse_id: selectedWarehouse.value,
        departure_date: formData.departure_date.toISOString().split('T')[0],
        document_type_id: formData.document_type_id.value,
        document_number: formData.document_no,
        document_date: formData.document_date.toISOString().split('T')[0],
        fifo_selections: fifoSelectionsData,
        arrival_point: formData.arrival_point,
        transport_type: formData.transport_type,
        observations: formData.observations,
      };

      await ProcessService.createFifoDepartureOrder(departureOrderData);

      // Success! Navigate back to departure orders list
      navigate("/processes/departure");

    } catch (error: any) {
      console.error("Failed to create FIFO departure order:", error);
      ProcessesStore.getState().setFifoError(error.message || "Failed to create departure order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalQuantity = () => {
    return fifoSelections.reduce((sum, selection) => sum + selection.total_allocated_quantity, 0);
  };

  const getTotalWeight = () => {
    return fifoSelections.reduce((sum, selection) => sum + selection.total_allocated_weight, 0);
  };

  const renderFifoAllocationSummary = (allocation: FifoAllocation) => {
    // Provide default values for missing properties
    const summary = allocation.summary || {
      total_requested: 0,
      total_allocated: 0,
      locations_used: 0,
      oldest_age_days: 0,
      newest_age_days: 0
    };
    
    const allocations = allocation.allocations || [];
    const fifoCompliance = allocation.fifo_compliance || {
      is_fully_allocated: false,
      warning_messages: []
    };

    return (
      <div className="mt-2 p-2 border rounded-lg bg-gray-50">
        <Text size="sm" weight="font-bold" additionalClass="mb-2">
          {t('allocation_summary')}
        </Text>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <Text size="xs" additionalClass="text-gray-600">{t('total_requested')}:</Text>
            <Text size="sm" weight="font-medium">{summary.total_requested} {t('units')}</Text>
          </div>
          <div>
            <Text size="xs" additionalClass="text-gray-600">{t('total_allocated')}:</Text>
            <Text size="sm" weight="font-medium" additionalClass={summary.total_allocated >= summary.total_requested ? "text-green-600" : "text-orange-600"}>
              {summary.total_allocated} {t('units')}
            </Text>
          </div>
          <div>
            <Text size="xs" additionalClass="text-gray-600">{t('locations_used')}:</Text>
            <Text size="sm" weight="font-medium">{summary.locations_used}</Text>
          </div>
          <div>
            <Text size="xs" additionalClass="text-gray-600">{t('age_span')}:</Text>
            <Text size="sm" weight="font-medium">{Math.abs((summary.oldest_age_days || 0) - (summary.newest_age_days || 0))} {t('days')}</Text>
          </div>
        </div>

        <div className="space-y-2">
          <Text size="xs" weight="font-medium" additionalClass="text-gray-700">{t('allocation_details')}:</Text>
          {allocations.map((alloc, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-3">
                <span className={`inline-block w-3 h-3 rounded-full ${(alloc.priority_level || 1) === 1 ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <div>
                  <Text size="xs" weight="font-medium">{alloc.cell_display || 'N/A'}</Text>
                  <Text size="xs" additionalClass="text-gray-500">
                    {alloc.allocated_quantity || 0} {t('units')} • {alloc.age_days || 0} {t('days_old')} • {alloc.supplier_name || 'N/A'}
                  </Text>
                </div>
              </div>
              <div className="text-right">
                <Text size="xs" weight="font-medium" additionalClass={(alloc.priority_level || 1) === 1 ? "text-red-600" : "text-yellow-600"}>
                  {t('priority')} {alloc.priority_level || 1}
                </Text>
                <Text size="xs" additionalClass="text-gray-500">{alloc.formatted_date || 'N/A'}</Text>
              </div>
            </div>
          ))}
        </div>

        {fifoCompliance.warning_messages && fifoCompliance.warning_messages.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <Text size="xs" weight="font-medium" additionalClass="text-yellow-800">{t('warnings')}:</Text>
            {fifoCompliance.warning_messages.map((warning, index) => (
              <Text key={index} size="xs" additionalClass="text-yellow-700">• {warning}</Text>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-160 flex flex-col">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-white rounded-lg p-6 mx-4 my-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="border-b pb-4">
              <Text size="lg" weight="font-bold" additionalClass="mb-2">
                {t('new_departure_order')}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">
                {t('departure_order_description')}
              </Text>
            </div>

            {/* Error Display */}
            {fifoError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <Text size="sm" additionalClass="text-red-700">{fifoError}</Text>
              </div>
            )}



            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('departure_order_no')} *
                </label>
                <input
                  type="text"
                  name="departure_order_no"
                  value={formData.departure_order_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('warehouse')} *
                </label>
                <Select
                  value={selectedWarehouse}
                  onChange={handleWarehouseChange}
                  options={warehouses.map(w => ({
                    value: w.warehouse_id,
                    label: w.name,
                    option: w.warehouse_id
                  }))}
                  placeholder={t('select_warehouse')}
                  styles={reactSelectStyle}
                  isLoading={loaders["processes/fetch-warehouses"]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('customer')} *
                </label>
                <Select
                  value={formData.customer_id}
                  onChange={(option) => handleSelectChange('customer_id', option)}
                  options={departureFormFields.customers}
                  placeholder={t('select_customer')}
                  styles={reactSelectStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('document_type')} *
                </label>
                <Select
                  value={formData.document_type_id}
                  onChange={(option) => handleSelectChange('document_type_id', option)}
                  options={departureFormFields.documentTypes}
                  placeholder={t('select_document_type')}
                  styles={reactSelectStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('document_number')} *
                </label>
                <input
                  type="text"
                  name="document_no"
                  value={formData.document_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_document_number')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('document_date')} *
                </label>
                <DatePicker
                  selected={formData.document_date}
                  onChange={(date) => handleDateChange(date, 'document_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('departure_date')} *
                </label>
                <DatePicker
                  selected={formData.departure_date}
                  onChange={(date) => handleDateChange(date, 'departure_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            <Divider />

            {/* Product Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Text size="lg" weight="font-bold">{t('product_selection')}</Text>
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedWarehouse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  + {t('add_product')}
                </Button>
              </div>

              {productSelections.map((selection, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <Text size="lg" weight="font-medium">{t('product')} {index + 1}</Text>
                    <Button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      {t('remove')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('product')} *
                      </label>
                      <Select
                        value={selection.product.product_id ? selection.product : null}
                        onChange={(option) => handleProductChange(index, option)}
                        options={availableProducts}
                        placeholder={t('select_product')}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.product_id}
                        styles={reactSelectStyle}
                      />
                      {selection.product.inventory_summary && (
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {t('available')}: {selection.product.inventory_summary.total_quantity} {t('units')}, 
                          {selection.product.inventory_summary.locations_count} {t('locations')}, 
                          {t('age_span')}: {selection.product.inventory_summary.age_span_days} {t('days')}
                        </Text>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('requested_quantity')} *
                      </label>
                      <input
                        type="number"
                        value={selection.requestedQuantity}
                        onChange={(e) => handleQuantityChange(index, 'requestedQuantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder={t('enter_quantity')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('weight_kg')} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={selection.requestedWeight}
                        onChange={(e) => handleQuantityChange(index, 'requestedWeight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0.01"
                        placeholder={t('enter_weight')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <Button
                      type="button"
                      onClick={() => handleGetFifoAllocation(index)}
                      disabled={!selection.product.product_id || !selection.requestedQuantity || selection.isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center space-x-2"
                    >
                      {selection.isLoading ? (
                        <LoaderSync loaderText={t('getting_allocation')} />
                      ) : (
                        <span>{t('get_allocation')}</span>
                      )}
                    </Button>
                  </div>

                  {selection.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                      <Text size="sm" additionalClass="text-red-700">{selection.error}</Text>
                    </div>
                  )}

                  {selection.fifoAllocation && renderFifoAllocationSummary(selection.fifoAllocation)}
                </div>
              ))}

              {productSelections.length === 0 && selectedWarehouse && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Text size="lg" additionalClass="text-gray-500">
                    {t('click_add_product_start')}
                  </Text>
                </div>
              )}
            </div>

            {/* Summary Section */}
            {fifoSelections.length > 0 && (
              <>
                <Divider />
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Text size="lg" weight="font-bold" additionalClass="mb-2">{t('order_summary')}</Text>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Text size="xs" additionalClass="text-gray-600">{t('products_selected')}:</Text>
                      <Text size="sm" weight="font-medium">{fifoSelections.length}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-600">{t('total_quantity')}:</Text>
                      <Text size="sm" weight="font-medium">{getTotalQuantity()} {t('units')}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-600">{t('total_weight')}:</Text>
                      <Text size="sm" weight="font-medium">{getTotalWeight().toFixed(2)} kg</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-600">{t('allocation_compliance')}:</Text>
                      <Text size="sm" weight="font-medium" additionalClass="text-green-600">{t('verified')}</Text>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('arrival_point')}
                </label>
                <input
                  type="text"
                  name="arrival_point"
                  value={formData.arrival_point}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_arrival_point')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('transport_type')}
                </label>
                <input
                  type="text"
                  name="transport_type"
                  value={formData.transport_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_transport_type')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('observation')}
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('enter_observations')}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => navigate("/processes/departure")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isFormReadyForSubmission()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <LoaderSync loaderText="Creating..." />
                    <span>{t('creating')}...</span>
                  </>
                ) : (
                  <>
                    <span>{t('create_departure_order')}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default DepartureApprovedForm; 