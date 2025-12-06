/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { Button, Text } from "@/components";
import FileUpload from "@/components/FileUpload";
import ProcessesStore, { ProductRow } from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";

const ComprehensiveDepartureForm: React.FC = () => {
  const { t } = useTranslation(['process']);
  const navigate = useNavigate();
  
  // ✅ Document type options for Departure Orders
  const DEPARTURE_DOCUMENT_TYPES = [
    { value: 'CUSTOMER_DISPATCH_NOTE', label: t('process:customer_dispatch_note') || 'Customer Dispatch Note' },
    { value: 'TRANSPORT_DISPATCH_NOTE', label: t('process:transport_dispatch_note') || 'Transport Dispatch Note' },
    { value: 'WAREHOUSE_EXIT_NOTE', label: t('process:warehouse_exit_note') || 'Warehouse Exit Note' }
  ];
  
  const {
    departureFormFields,
    warehouses,
    loaders,
    comprehensiveDepartureFormData: formData,
    selectedWarehouse,
    departureFormProducts: products,
    isSubmittingDepartureForm: isSubmitting,
    departureFormError: error,
    fifoProductsWithInventory: availableProducts,
    setComprehensiveDepartureFormData,
    setSelectedWarehouse,
    addDepartureFormProduct,
    updateDepartureFormProduct,
    removeDepartureFormProduct,
    setIsSubmittingDepartureForm,
    setDepartureFormError,
    clearDepartureFormError,
    setFifoProductsWithInventory,
    startLoader,
    stopLoader,
  } = ProcessesStore();

  const fifoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ State for multi-select document types and files
  const [selectedDocumentTypes, setSelectedDocumentTypes] = React.useState<Array<{value: string, label: string}>>([]);
  const [documentFiles, setDocumentFiles] = React.useState<Record<string, File | null>>({});

  // ✅ Handle document type selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDocumentTypeChange = (selectedOptions: any) => {
    const newTypes = selectedOptions ? [...selectedOptions] : [];
    setSelectedDocumentTypes(newTypes);
    
    // Clear files for unselected document types
    const newDocumentFiles = { ...documentFiles };
    Object.keys(newDocumentFiles).forEach(type => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!newTypes.find((t: any) => t.value === type)) {
        delete newDocumentFiles[type];
      }
    });
    setDocumentFiles(newDocumentFiles);
  };

  // ✅ Handle file selection for specific document type
  const handleFileSelection = (documentType: string, file: File | null) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  useEffect(() => {
    const loadFormData = async () => {
      try {
        await Promise.all([
          ProcessService.loadDepartureFormFields(),
          ProcessService.fetchWarehouses(),
        ]);

        try {
          const currentOrderNo = await ProcessService.getCurrentDepartureOrderNo();
          console.log("Fetched departure order number from API:", currentOrderNo);
          setComprehensiveDepartureFormData({ departure_order_code: currentOrderNo });
        } catch (orderError) {
          console.error("Failed to fetch departure order number from API, using fallback:", orderError);
          const fallbackOrderCode = `DEP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
          setComprehensiveDepartureFormData({ departure_order_code: fallbackOrderCode });
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
        setDepartureFormError("Failed to load form data");
      }
    };

    loadFormData();
  }, [setComprehensiveDepartureFormData, setDepartureFormError]);

  useEffect(() => {
    if (selectedWarehouse?.value) {
      startLoader("processes/browse-products-inventory");
      ProcessService.browseProductsWithInventory(selectedWarehouse.value)
        .then((products) => {
          setFifoProductsWithInventory(products || []);
        })
        .catch((error) => {
          console.error("Failed to load products:", error);
          setDepartureFormError("Failed to load products");
          setFifoProductsWithInventory([]);
        })
        .finally(() => {
          stopLoader("processes/browse-products-inventory");
        });
    } else {
      setFifoProductsWithInventory([]);
    }
  }, [selectedWarehouse, setFifoProductsWithInventory, setDepartureFormError, startLoader, stopLoader]);

  const addProduct = () => {
    const newProduct: ProductRow = {
      id: Date.now().toString(),
      product_id: "",
      product_code: "",
      product_name: "",
      lot_number: "",
      quantity: "",
      weight: "",
      packaging_qty: "",
      packaging_type: "",
      entry_order_no: "",
      guide_number: "",
    };
    addDepartureFormProduct(newProduct);
  };

  const removeProduct = (id: string) => {
    removeDepartureFormProduct(id);
  };

  const updateProduct = (id: string, field: keyof ProductRow, value: unknown) => {
    console.log("updateProduct called:", { id, field, value });
    
    updateDepartureFormProduct(id, { [field]: value });

    if (field === 'product_id' && value) {
      console.log("Updating product_id, looking for product:", value);
      console.log("Available products:", availableProducts);
      const selectedProduct = availableProducts.find(p => p.product_id === value);
      console.log("Found selected product:", selectedProduct);
      
      if (selectedProduct) {
        // Handle the updated API response structure
        const productData = selectedProduct as typeof selectedProduct & {
          total_quantity?: number;
          location_count?: number;
          days_to_earliest_expiry?: number;
          has_expired?: boolean;
          has_near_expiry?: boolean;
          fifo_locations?: unknown[];
        };
        
        const availabilityInfo = t('process:available_units_locations', { 
          units: productData.total_quantity || 0, 
          locations: productData.location_count || 0 
        });
        const daysToExpiry = productData.days_to_earliest_expiry || 0;
        const expiryStatus = productData.has_expired ? "EXPIRED" : productData.has_near_expiry ? "URGENT" : "NORMAL";
        const fifoInfo = t('process:days_to_expiry_status', { 
          days: daysToExpiry, 
          status: expiryStatus 
        });

        console.log("Updating product with:", {
          product_code: selectedProduct.product_code,
          product_name: selectedProduct.product_name,
          availabilityInfo,
          fifoInfo,
          fifo_locations: productData.fifo_locations,
          total_quantity: productData.total_quantity,
          location_count: productData.location_count
        });

        updateDepartureFormProduct(id, {
          product_code: selectedProduct.product_code || "",
          product_name: selectedProduct.product_name || "",
          availability_info: availabilityInfo,
          fifo_info: fifoInfo,
        });
      } else {
        console.log("No product found with id:", value);
      }
    }

    if (field === 'quantity' && value && typeof value === 'number' && value > 0) {
      const product = products.find(p => p.id === id);
      if (product && product.product_id) {
        console.log("Triggering debounced FIFO allocation for quantity:", value);
        debouncedFifoAllocation(id, product.product_id, value);
      }
    }
  };

  const autoGetFifoAllocation = useCallback(async (productRowId: string, productId: string, quantity: number) => {
    console.log("Starting FIFO allocation for:", { productRowId, productId, quantity });
    
    updateDepartureFormProduct(productRowId, { isLoadingFifo: true });

    try {
      const selectedProduct = availableProducts.find(p => p.product_id === productId);
      if (selectedProduct) {
        // Handle the updated API response structure
        const productData = selectedProduct as typeof selectedProduct & {
          total_quantity?: number;
          fifo_locations?: Array<{
            cell_reference: string;
            entry_order_no: string;
            available_quantity: number;
            lot_series: string;
            supplier_name: string;
            expiration_date: string;
          }>;
        };

        if (productData.fifo_locations && productData.fifo_locations.length > 0) {
          let remainingQuantity = quantity;
          type AllocationItem = {
            cell_reference: string;
            entry_order_no: string;
            allocated_quantity: number;
            lot_series: string;
            supplier_name: string;
            expiration_date: string;
          };
          const allocations: AllocationItem[] = [];
          
          // Use actual FIFO locations from API
          for (const location of productData.fifo_locations) {
            if (remainingQuantity <= 0) break;
            
            const allocatedFromThisLocation = Math.min(remainingQuantity, location.available_quantity);
            allocations.push({
              cell_reference: location.cell_reference,
              entry_order_no: location.entry_order_no,
              allocated_quantity: allocatedFromThisLocation,
              lot_series: location.lot_series,
              supplier_name: location.supplier_name,
              expiration_date: location.expiration_date,
            });
            
            remainingQuantity -= allocatedFromThisLocation;
          }

          // Get all unique entry order numbers and lot series
          const uniqueEntryOrders = [...new Set(allocations.map(a => a.entry_order_no))];
          const uniqueLotSeries = [...new Set(allocations.map(a => a.lot_series))];
          
          updateDepartureFormProduct(productRowId, {
            fifo_allocations: allocations,
            isLoadingFifo: false,
            lot_number: uniqueLotSeries.join(", "),
            entry_order_no: uniqueEntryOrders.join(", "),
          });
        
          console.log("FIFO allocation completed successfully with real data:", allocations);
        } else {
          updateDepartureFormProduct(productRowId, { isLoadingFifo: false });
          console.log("No FIFO locations available for product");
        }
      } else {
        updateDepartureFormProduct(productRowId, { isLoadingFifo: false });
      }
    } catch (error) {
      console.error("Failed to get FIFO allocation:", error);
      updateDepartureFormProduct(productRowId, { isLoadingFifo: false });
    }
  }, [availableProducts, updateDepartureFormProduct]);

  const debouncedFifoAllocation = useCallback((productRowId: string, productId: string, quantity: number) => {
    if (fifoTimeoutRef.current) {
      clearTimeout(fifoTimeoutRef.current);
    }
    
    fifoTimeoutRef.current = setTimeout(() => {
      autoGetFifoAllocation(productRowId, productId, quantity);
    }, 800);
  }, [autoGetFifoAllocation]);

  useEffect(() => {
    return () => {
      if (fifoTimeoutRef.current) {
        clearTimeout(fifoTimeoutRef.current);
      }
    };
  }, []);

  const handleFormDataChange = (field: string, value: unknown) => {
    setComprehensiveDepartureFormData({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearDepartureFormError();
    
    if (!formData.departure_order_code.trim()) {
      setDepartureFormError("Departure order code is required");
      return;
    }
    if (!selectedWarehouse?.value) {
      setDepartureFormError("Please select a warehouse");
      return;
    }
    if (!formData.personnel_in_charge_id?.value) {
      setDepartureFormError("Please select personnel in charge");
      return;
    }
    if (!selectedDocumentTypes || selectedDocumentTypes.length === 0) {
      setDepartureFormError(t('process:please_select_at_least_one_document_type'));
      return;
    }
    if (products.length === 0) {
      setDepartureFormError("At least one product is required");
      return;
    }

    setIsSubmittingDepartureForm(true);
    
    try {
      // ✅ Use FormData for multipart upload with multiple documents
      const formDataToSend = new FormData();

      // ✅ Get client_id from localStorage for CLIENT users
      const userRole = localStorage.getItem('role');
      const clientId = localStorage.getItem('client_id');

      const orderData = {
        departure_order_code: formData.departure_order_code,
        // ✅ FIXED: Send client_id for CLIENT users, not personnel user ID
        client_id: userRole === 'CLIENT' ? clientId : undefined,
        personnel_in_charge_id: formData.personnel_in_charge_id?.value || undefined,
        warehouse_id: selectedWarehouse.value,
        document_number: formData.document_number,
        document_date: formData.document_date,
        dispatch_document_number: formData.dispatch_document_number,
        departure_date: formData.departure_date,
        entry_date_time: new Date().toISOString(),
        transport_type: formData.transport_type,
        arrival_point: formData.arrival_point,
        observations: formData.observations,
        special_instructions: "",
        priority_level: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        products: products.map(product => ({
          product_id: product.product_id,
          product_code: product.product_code,
          product_name: product.product_name,
          requested_quantity: typeof product.quantity === 'number' ? product.quantity : 0,
          requested_weight: typeof product.weight === 'number' ? product.weight : 0,
          packaging_quantity: typeof product.packaging_qty === 'number' ? product.packaging_qty : 0,
          pallet_quantity: 0,
          lot_number: product.lot_number,
          packaging_type: product.packaging_type,
          presentation: "CAJA",
          entry_order_no: product.entry_order_no,
          guide_number: product.guide_number,
          fifo_allocations: undefined,
        })),
      };

      // ✅ Append non-product form data
      Object.keys(orderData).forEach(key => {
        if (key !== 'products') {
          formDataToSend.append(key, String(orderData[key as keyof typeof orderData]));
        }
      });

      // ✅ Append products array - Send each product individually
      orderData.products.forEach((product, index) => {
        Object.keys(product).forEach(productKey => {
          const value = product[productKey as keyof typeof product];
          if (value !== null && value !== undefined) {
            formDataToSend.append(`products[${index}][${productKey}]`, String(value));
          }
        });
      });

      // ✅ Append document types
      const documentTypesArray = selectedDocumentTypes.map(type => type.value);
      formDataToSend.append('document_types', JSON.stringify(documentTypesArray));

      // ✅ Append files
      selectedDocumentTypes.forEach(docType => {
        const file = documentFiles[docType.value];
        if (file) {
          formDataToSend.append('documents', file);
        }
      });

      // ✅ Submit using new ProcessService method for document uploads
      const result = await ProcessService.createComprehensiveDepartureOrderWithDocuments(formDataToSend);

      // Log document upload results if available
      if (result.document_uploads) {
        console.log('📎 Document upload results:', result.document_uploads);
      }
      
      navigate("/processes/departure");
    } catch (error: unknown) {
      setDepartureFormError(error instanceof Error ? error.message : "Failed to create departure order");
    } finally {
      setIsSubmittingDepartureForm(false);
    }
  };

  if (loaders["processes/load-departure-form-fields"]) {
    return <div className="p-4">{t('process:loading')}</div>;
  }

  return (
    <div className="p-4 bg-white">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <table className="w-full border-collapse border border-gray-300 mb-4">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium w-48">
                {t('departure_order_code')} *
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={loaders["processes/get-departure-order-no"] ? t('process:loading') : formData.departure_order_code}
                  className="w-full border border-gray-300 p-1 bg-gray-100"
                  readOnly
                />
              </td>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium w-48">
                {t('warehouse')} *
              </td>
              <td className="border border-gray-300 p-2">
                <Select
                  value={selectedWarehouse}
                  onChange={setSelectedWarehouse}
                  options={warehouses.map(w => ({
                    value: w.warehouse_id,
                    label: w.name,
                  }))}
                  placeholder={t('select_warehouse')}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('personnel_in_charge')} *
              </td>
              <td className="border border-gray-300 p-2">
                <Select
                  value={formData.personnel_in_charge_id}
                  onChange={(option) => handleFormDataChange('personnel_in_charge_id', option || { option: "", value: "", label: "" })}
                  options={departureFormFields.personnel}
                  placeholder={t('select_personnel')}
                />
              </td>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium" colSpan={2}>
                {/* Document Type field removed - using Document Upload section instead */}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('document_number')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => handleFormDataChange('document_number', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('dispatch_document_number')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={formData.dispatch_document_number}
                  onChange={(e) => handleFormDataChange('dispatch_document_number', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('document_date')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) => handleFormDataChange('document_date', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('departure_date')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => handleFormDataChange('departure_date', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('transport_type')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={formData.transport_type}
                  onChange={(e) => handleFormDataChange('transport_type', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
              <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                {t('arrival_point')}
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={formData.arrival_point}
                  onChange={(e) => handleFormDataChange('arrival_point', e.target.value)}
                  className="w-full border border-gray-300 p-1"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ✅ NEW: Multi-Document Upload Section */}
        <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Text
            size="sm"
            weight="font-semibold"
            additionalClass="mb-3 text-gray-800"
          >
            📎 {t("process:document_upload")} *
          </Text>
          
          {/* Document Type Multi-Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("process:document_type")} *
            </label>
            <Select
              isMulti
              options={DEPARTURE_DOCUMENT_TYPES}
              value={selectedDocumentTypes}
              onChange={handleDocumentTypeChange}
              placeholder={t("process:select_document_types_placeholder")}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("process:max_10_files_10mb_each")}
            </p>
          </div>

          {/* Document Upload Areas */}
          {selectedDocumentTypes.length > 0 && (
            <div className="space-y-4">
              {selectedDocumentTypes.map((docType) => (
                <div key={docType.value} className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Text
                      size="sm"
                      weight="font-medium"
                      additionalClass="text-gray-700"
                    >
                      📄 {docType.label}
                    </Text>
                    {documentFiles[docType.value] && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✅ {t("process:file_selected")}
                      </span>
                    )}
                  </div>
                  <FileUpload
                    id={`departure_document_upload_${docType.value}`}
                    label={`${t("process:upload")} ${docType.label}`}
                    onFileSelected={(file: File) => handleFileSelection(docType.value, file)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                  />
                  {documentFiles[docType.value] && (
                    <div className="mt-2 text-xs text-gray-600">
                      📎 {documentFiles[docType.value]?.name} 
                      ({Math.round((documentFiles[docType.value]?.size || 0) / 1024)} KB)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Text size="lg" weight="font-bold">{t('products')}</Text>
            <Button
              type="button"
              onClick={addProduct}
              disabled={!selectedWarehouse || loaders["processes/browse-products-inventory"]}
              className={`px-3 py-1 text-sm text-white ${
                !selectedWarehouse || loaders["processes/browse-products-inventory"]
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loaders["processes/browse-products-inventory"] ? t('process:loading_products') : `+ ${t('add_product')}`}
            </Button>
          </div>

          {products.length > 0 && (
            <div className="overflow-x-auto border border-gray-300">
              <table className="border-collapse" style={{ minWidth: '1700px' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '200px' }}>{t('product')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '120px' }}>{t('product_code')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '100px' }}>{t('lot_number')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '80px' }}>{t('quantity_inventory_units')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '80px' }}>{t('weight_kg')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '100px' }}>{t('packaging_quantity')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '120px' }}>{t('packaging_type')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '120px' }}>{t('entry_order_no')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '120px' }}>{t('guide_number')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '250px' }}>{t('process:fifo_info')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '300px' }}>{t('process:fifo_allocation')}</th>
                    <th className="border border-gray-300 p-2 text-left" style={{ minWidth: '80px' }}>{t('process:action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '200px' }}>
                        <Select
                          value={availableProducts.find(p => p.product_id === product.product_id) || null}
                          onChange={(option) => {
                            console.log("Product selection changed:", option);
                            if (option && option.product_id) {
                              console.log("Valid product selected:", option.product_id);
                              updateProduct(product.id, 'product_id', option.product_id);
                            } else {
                              console.log("Product cleared or invalid");
                              updateProduct(product.id, 'product_id', '');
                            }
                          }}
                          options={availableProducts}
                          getOptionLabel={(option) => `${option.product_code} - ${option.product_name}`}
                          getOptionValue={(option) => option.product_id}
                          placeholder={loaders["processes/browse-products-inventory"] ? t('process:loading_products') : t('select_product')}
                          noOptionsMessage={() => t('process:no_products_available')}
                          isLoading={loaders["processes/browse-products-inventory"]}
                          isDisabled={!selectedWarehouse || loaders["processes/browse-products-inventory"]}
                          isClearable={true}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({ 
                              ...base, 
                              minHeight: '32px', 
                              fontSize: '14px',
                              border: '1px solid #d1d5db',
                              '&:hover': { border: '1px solid #9ca3af' }
                            }),
                            option: (base) => ({ ...base, fontSize: '14px' }),
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '120px' }}>
                        <input
                          type="text"
                          value={product.product_code}
                          className="w-full border border-gray-300 p-1 text-sm bg-gray-100"
                          style={{ color: '#000000' }}
                          placeholder={t('process:auto_filled')}
                          readOnly
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '100px' }}>
                        <input
                          type="text"
                          value={product.lot_number}
                          onChange={(e) => updateProduct(product.id, 'lot_number', e.target.value)}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '80px' }}>
                        <input
                          type="number"
                          value={product.quantity === '' ? '' : String(product.quantity)}
                          onChange={(e) => {
                            console.log("Quantity input changed:", e.target.value);
                            const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
                            console.log("Converted value:", newValue);
                            updateProduct(product.id, 'quantity', newValue);
                          }}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                          min="0"
                          onFocus={() => console.log("Quantity field focused, current value:", product.quantity)}
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '80px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={product.weight === '' ? '' : String(product.weight)}
                          onChange={(e) => updateProduct(product.id, 'weight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '100px' }}>
                        <input
                          type="number"
                          value={product.packaging_qty === '' ? '' : String(product.packaging_qty)}
                          onChange={(e) => updateProduct(product.id, 'packaging_qty', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '120px' }}>
                        <input
                          type="text"
                          value={product.packaging_type}
                          onChange={(e) => updateProduct(product.id, 'packaging_type', e.target.value)}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '120px' }}>
                        <div 
                          className="w-full border border-gray-300 p-1 text-sm bg-gray-100 rounded"
                          style={{ 
                            color: '#000000',
                            backgroundColor: '#f9fafb',
                            minHeight: '32px',
                            maxHeight: '80px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            display: 'flex',
                            alignItems: 'flex-start',
                            paddingTop: '6px'
                          }}
                          title={product.entry_order_no || t('process:auto_filled')}
                        >
                          {product.entry_order_no || (
                            <span className="text-gray-500 italic">
                              {t('process:auto_filled')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '120px' }}>
                        <input
                          type="text"
                          value={product.guide_number}
                          onChange={(e) => updateProduct(product.id, 'guide_number', e.target.value)}
                          className="w-full border border-gray-300 p-1 text-sm"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        />
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '250px' }}>
                        <div className="text-xs">
                          <div className="text-blue-600">{product.availability_info || t('process:select_product_first')}</div>
                          <div className="text-green-600">{product.fifo_info || ""}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-1" style={{ minWidth: '300px' }}>
                        <div className="text-xs">
                          {product.isLoadingFifo && (
                            <div className="text-blue-500">{t('process:loading_fifo_allocation')}</div>
                          )}
                          {product.fifo_allocations && product.fifo_allocations.length > 0 ? (
                            <div>
                              <div className="font-semibold text-green-700 mb-1">
                                {t('process:allocated_from_locations', { count: product.fifo_allocations.length })}
                              </div>
                              {product.fifo_allocations.map((allocation: any, idx: number) => (
                                <div key={idx} className="mb-1 p-1 bg-gray-50 rounded">
                                  <div className="text-blue-600">
                                    📍 {t('process:cell')}: {allocation.cell_reference} | {t('process:order')}: {allocation.entry_order_no}
                                  </div>
                                  <div className="text-gray-600">
                                    {t('process:qty')}: {allocation.allocated_quantity} | {t('process:lot')}: {allocation.lot_series}
                                  </div>
                                  <div className="text-orange-600">
                                    {allocation.supplier_name} | {t('process:exp')}: {new Date(allocation.expiration_date).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            product.quantity && typeof product.quantity === 'number' && product.quantity > 0 && !product.isLoadingFifo && (
                              <div className="text-gray-400">{t('process:enter_quantity_to_see_fifo')}</div>
                            )
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-1 text-center" style={{ minWidth: '80px' }}>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          {t('process:remove')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">{t('observations')}</label>
          <textarea
            value={formData.observations}
            onChange={(e) => handleFormDataChange('observations', e.target.value)}
            className="w-full border border-gray-300 p-2"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={() => navigate("/processes/departure")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {t('process:cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? t('process:creating') : t('create_departure_order')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ComprehensiveDepartureForm; 