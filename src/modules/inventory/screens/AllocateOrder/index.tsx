/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useInventoryLogStore, ProductReadyForAssignment } from "@/modules/inventory/store";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { Button, Text, LoaderSync, Divider } from "@/components";
import CellGrid, { Cell } from "./components/CellGrid";

// ✅ Updated interface to match new inventory flow
interface FormData {
  selected_entry_order: any | null;
  selected_product: ProductReadyForAssignment | null;
  warehouse_id: { value: string; label: string } | null;
  cell_id: string;
  inventory_quantity: string;
  package_quantity: string;
  quantity_pallets: string;
  presentation: string;
  weight_kg: string;
  guide_number: string;
  product_status: string;
  uploaded_documents: File[] | null;
  observations: string;
}

// ✅ Consistent react-select styling with the rest of the app
const reactSelectStyle = {
  container: (style: any) => ({
    ...style,
    height: "2.5rem",
  }),
};

const AssignProduct: React.FC = () => {
  const { t } = useTranslation(['inventory', 'common', 'process']);
  const navigate = useNavigate();
  const {
    warehouses,
    cells,
    loaders,
  } = useInventoryLogStore();

  const [approvedEntryOrders, setApprovedEntryOrders] = useState<any[]>([]);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    selected_entry_order: null,
    selected_product: null,
    warehouse_id: null,
    cell_id: "",
    inventory_quantity: "",
    package_quantity: "",
    quantity_pallets: "",
    presentation: "PALETA",
    weight_kg: "",
    guide_number: "",
    product_status: "30-PAL-NORMAL",
    uploaded_documents: null,
    observations: "",
  });

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLoadingWarehouses = loaders["inventoryLogs/fetch-warehouses"];
  const isLoadingCells = loaders["inventoryLogs/fetch-cells"];
  const isAssigning = loaders["inventoryLogs/assign-product-to-cell"];

  // ✅ Presentation options with translations
  const presentationOptions = [
    { value: "PALETA", label: t('process:paleta') },
    { value: "CAJA", label: t('process:caja') },
    { value: "SACO", label: t('process:saco') },
    { value: "UNIDAD", label: t('process:unidad') },
    { value: "PAQUETE", label: t('process:paquete') },
    { value: "TAMBOS", label: t('process:tambo') },
    { value: "BULTO", label: t('process:bulto') },
    { value: "OTRO", label: t('process:otro') },
  ];

  // ✅ Product status options with enhanced labels and translations
  const productStatusOptions = [
    // Normal statuses
    { value: "30-PAL-NORMAL", label: `30-PAL-NORMAL (${t('inventory:pallet_normal')})` },
    { value: "31-CAJ-NORMAL", label: `31-CAJ-NORMAL (${t('inventory:box_normal')})` },
    { value: "32-SAC-NORMAL", label: `32-SAC-NORMAL (${t('inventory:sack_normal')})` },
    { value: "33-UNI-NORMAL", label: `33-UNI-NORMAL (${t('inventory:unit_normal')})` },
    { value: "34-PAQ-NORMAL", label: `34-PAQ-NORMAL (${t('inventory:package_normal')})` },
    { value: "35-TAM-NORMAL", label: `35-TAM-NORMAL (${t('inventory:drum_normal')})` },
    { value: "36-BUL-NORMAL", label: `36-BUL-NORMAL (${t('inventory:bundle_normal')})` },
    { value: "37-OTR-NORMAL", label: `37-OTR-NORMAL (${t('inventory:other_normal')})` },
    
    // Damaged statuses
    { value: "40-PAL-DAÑADA", label: `40-PAL-DAÑADA (${t('inventory:pallet_damaged')})` },
    { value: "41-CAJ-DAÑADA", label: `41-CAJ-DAÑADA (${t('inventory:box_damaged')})` },
    { value: "42-SAC-DAÑADO", label: `42-SAC-DAÑADO (${t('inventory:sack_damaged')})` },
    { value: "43-UNI-DAÑADA", label: `43-UNI-DAÑADA (${t('inventory:unit_damaged')})` },
    { value: "44-PAQ-DAÑADO", label: `44-PAQ-DAÑADO (${t('inventory:package_damaged')})` },
    { value: "45-TAM-DAÑADO", label: `45-TAM-DAÑADO (${t('inventory:drum_damaged')})` },
    { value: "46-BUL-DAÑADO", label: `46-BUL-DAÑADO (${t('inventory:bundle_damaged')})` },
    { value: "47-OTR-DAÑADO", label: `47-OTR-DAÑADO (${t('inventory:other_damaged')})` },
  ];

  // Load initial data on mount
  useEffect(() => {
    InventoryLogService.fetchWarehouses();
    fetchApprovedEntryOrders();
  }, []);

  // ✅ Fetch approved entry orders
  const fetchApprovedEntryOrders = async () => {
    try {
      const response = await InventoryLogService.fetchApprovedEntryOrders();
      setApprovedEntryOrders(response);
    } catch (error) {
      console.error("Error fetching approved entry orders:", error);
      setError(t('inventory:failed_to_load_entry_orders'));
    }
  };

  // ✅ Fetch products for selected entry order
  const fetchEntryOrderProducts = async (entryOrderId: string) => {
    try {
      const response = await InventoryLogService.fetchEntryOrderProducts(entryOrderId);
      setSelectedOrderProducts(response.products);
    } catch (error) {
      console.error("Error fetching entry order products:", error);
      setError(t('inventory:failed_to_load_products'));
    }
  };

  // Load cells when warehouse is selected
  useEffect(() => {
    if (formData.warehouse_id?.value) {
      InventoryLogService.fetchAvailableCells(formData.warehouse_id.value);
    }
  }, [formData.warehouse_id?.value]);

  const handleEntryOrderSelect = async (selectedOption: any) => {
    const order = selectedOption?.value ? approvedEntryOrders.find(o => o.entry_order_id === selectedOption.value) : null;
    setFormData(prev => ({
      ...prev,
      selected_entry_order: order,
      selected_product: null,
      warehouse_id: null,
      cell_id: "",
    }));
    setSelectedOrderProducts([]);
    setSelectedCell(null);
    setError(null);
    setSuccess(null);
    if (order) {
      await fetchEntryOrderProducts(order.entry_order_id);
    }
  };

  const handleProductSelect = (selectedOption: any) => {
    const product = selectedOption?.value ? selectedOrderProducts.find(p => p.entry_order_product_id === selectedOption.value) : null;
    
    // ✅ Set default product status based on presentation
    let defaultProductStatus = "30-PAL-NORMAL"; // Default to paleta normal
    if (product?.presentation) {
      const presentationMap: Record<string, string> = {
        "PALETA": "30-PAL-NORMAL",
        "CAJA": "31-CAJ-NORMAL",
        "SACO": "32-SAC-NORMAL",
        "UNIDAD": "33-UNI-NORMAL",
        "PAQUETE": "34-PAQ-NORMAL",
        "TAMBOS": "35-TAM-NORMAL",
        "BULTO": "36-BUL-NORMAL",
        "OTRO": "37-OTR-NORMAL",
      };
      defaultProductStatus = presentationMap[product.presentation] || "30-PAL-NORMAL";
    }
    
    // ✅ Calculate remaining package quantity properly
    // If remaining_packaging_qty is available, use it; otherwise calculate proportionally
    const remainingPackageQty = product?.remaining_packaging_qty || 
                                (product?.package_quantity && product?.remaining_quantity && product?.inventory_quantity ? 
                                  Math.floor((product.package_quantity / product.inventory_quantity) * product.remaining_quantity) : 
                                  product?.remaining_quantity || 0);
    
    // ✅ Calculate remaining weight properly
    // If remaining_weight is available, use it; otherwise calculate proportionally
    const remainingWeight = product?.remaining_weight || 
                           (product?.weight_kg && product?.remaining_quantity && product?.inventory_quantity ? 
                             (parseFloat(product.weight_kg.toString()) / product.inventory_quantity) * product.remaining_quantity : 
                             product?.remaining_quantity || 0);

    console.log("Product selection debug:", {
      product_code: product?.product?.product_code,
      original_inventory: product?.inventory_quantity,
      original_package: product?.package_quantity,
      original_weight: product?.weight_kg,
      remaining_quantity: product?.remaining_quantity,
      remaining_packaging_qty: product?.remaining_packaging_qty,
      remaining_weight: product?.remaining_weight,
      calculated_package_qty: remainingPackageQty,
      calculated_weight: remainingWeight
    });

    setFormData(prev => ({
      ...prev,
      selected_product: product,
      inventory_quantity: product?.remaining_quantity?.toString() || "",
      package_quantity: remainingPackageQty.toString(),
      quantity_pallets: "",
      presentation: product?.presentation || "PALETA",
      weight_kg: remainingWeight.toString(),
      guide_number: product?.guide_number || "",
      product_status: defaultProductStatus, // ✅ Use calculated default
      observations: "",
      warehouse_id: null,
      cell_id: "",
    }));
    setSelectedCell(null);
    setError(null);
    setSuccess(null);
  };

  const handleWarehouseChange = (selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      warehouse_id: selectedOption,
      cell_id: "",
    }));
    setSelectedCell(null);
    setError(null);
    setSuccess(null);
  };

  const handleCellSelect = (cell: Cell) => {
    setFormData(prev => ({ ...prev, cell_id: cell.cell_id }));
    setSelectedCell(cell);
    setError(null);
    setSuccess(null);
  };

  // ✅ Enhanced input change handler with presentation/status sync
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // ✅ If presentation changes, suggest matching product status
    if (name === "presentation") {
      const presentationMap: Record<string, string> = {
        "PALETA": "30-PAL-NORMAL",
        "CAJA": "31-CAJ-NORMAL", 
        "SACO": "32-SAC-NORMAL",
        "UNIDAD": "33-UNI-NORMAL",
        "PAQUETE": "34-PAQ-NORMAL",
        "TAMBOS": "35-TAM-NORMAL",
        "BULTO": "36-BUL-NORMAL",
        "OTRO": "37-OTR-NORMAL",
      };
      
      const suggestedStatus = presentationMap[value] || "30-PAL-NORMAL";
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        product_status: suggestedStatus // ✅ Auto-sync product status
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
    setSuccess(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({ ...prev, uploaded_documents: Array.from(files) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ✅ Enhanced validation with translated error messages
    const validationErrors: string[] = [];

    if (!formData.selected_product) {
      validationErrors.push(t('inventory:please_select_product'));
    }
    if (!formData.warehouse_id?.value) {
      validationErrors.push(t('inventory:please_select_warehouse'));
    }
    if (!formData.cell_id) {
      validationErrors.push(t('inventory:please_select_cell'));
    }
    if (!formData.inventory_quantity || formData.inventory_quantity.trim() === "") {
      validationErrors.push(t('inventory:inventory_quantity_required'));
    }
    if (!formData.package_quantity || formData.package_quantity.trim() === "") {
      validationErrors.push(t('inventory:package_quantity_required'));
    }
    if (!formData.weight_kg || formData.weight_kg.trim() === "") {
      validationErrors.push(t('inventory:weight_required'));
    }
    if (!formData.presentation) {
      validationErrors.push(t('inventory:presentation_required'));
    }
    if (!formData.product_status) {
      validationErrors.push(t('inventory:product_status_required'));
    }

    // ✅ Check if user is authenticated
    const userId = localStorage.getItem("id");
    if (!userId) {
      validationErrors.push(t('inventory:user_not_authenticated'));
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    // ✅ Type guard to ensure we have required data before proceeding
    if (!formData.selected_product || !formData.warehouse_id) {
      setError(t('inventory:missing_required_data'));
      return;
    }

    const inventoryQty = parseInt(formData.inventory_quantity);
    const packageQty = parseInt(formData.package_quantity);
    const weight = parseFloat(formData.weight_kg);
    const pallets = formData.quantity_pallets ? parseInt(formData.quantity_pallets) : undefined;

    // ✅ Numeric validation with translated messages
    if (isNaN(inventoryQty) || inventoryQty <= 0) {
      setError(t('inventory:inventory_quantity_invalid'));
      return;
    }
    if (isNaN(packageQty) || packageQty <= 0) {
      setError(t('inventory:package_quantity_invalid'));
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      setError(t('inventory:weight_invalid'));
      return;
    }
    if (formData.quantity_pallets && (isNaN(pallets!) || pallets! < 0)) {
      setError(t('inventory:quantity_pallets_invalid'));
      return;
    }

    // ✅ Validate against remaining quantities
    const maxQuantity = formData.selected_product.remaining_quantity || formData.selected_product.inventory_quantity;
    
    // Calculate remaining package quantity for validation
    const maxPackageQty = formData.selected_product.remaining_packaging_qty || 
                          (formData.selected_product.package_quantity && formData.selected_product.remaining_quantity && formData.selected_product.inventory_quantity ? 
                            Math.floor((formData.selected_product.package_quantity / formData.selected_product.inventory_quantity) * formData.selected_product.remaining_quantity) : 
                            formData.selected_product.remaining_quantity || 0);
    
    // Calculate remaining weight for validation
    const maxWeight = formData.selected_product.remaining_weight || 
                      (formData.selected_product.weight_kg && formData.selected_product.remaining_quantity && formData.selected_product.inventory_quantity ? 
                        (parseFloat(formData.selected_product.weight_kg.toString()) / formData.selected_product.inventory_quantity) * formData.selected_product.remaining_quantity : 
                        formData.selected_product.remaining_quantity || 0);

    if (inventoryQty > maxQuantity) {
      setError(t('inventory:cannot_assign_more_than', { max: maxQuantity }));
      return;
    }

    if (packageQty > maxPackageQty) {
      setError(`Cannot assign more than ${maxPackageQty} packages (remaining available)`);
      return;
    }

    if (weight > maxWeight) {
      setError(`Cannot assign more than ${maxWeight} kg (remaining available)`);
      return;
    }

    try {
      console.log("Submitting assignment with data:", {
        entry_order_product_id: formData.selected_product.entry_order_product_id,
        cell_id: formData.cell_id,
        inventory_quantity: inventoryQty,
        package_quantity: packageQty,
        quantity_pallets: pallets,
        presentation: formData.presentation,
        weight_kg: weight,
        volume_m3: formData.selected_product.volume_m3,
        guide_number: formData.guide_number || undefined,
        product_status: formData.product_status,
        warehouse_id: formData.warehouse_id.value,
        uploaded_documents_count: formData.uploaded_documents?.length || 0,
        observations_length: formData.observations?.length || 0,
        user_id: userId,
      });

      // ✅ Use the service to handle the assignment with proper type safety
      const result = await InventoryLogService.assignProductToCell({
        entry_order_product_id: formData.selected_product.entry_order_product_id,
        cell_id: formData.cell_id,
        inventory_quantity: inventoryQty,
        package_quantity: packageQty,
        quantity_pallets: pallets,
        presentation: formData.presentation,
        weight_kg: weight,
        volume_m3: formData.selected_product.volume_m3,
        guide_number: formData.guide_number || undefined,
        product_status: formData.product_status,
        uploaded_documents: formData.uploaded_documents,
        observations: formData.observations || undefined,
        warehouse_id: formData.warehouse_id.value,
      });

      setSuccess(t('inventory:assignment_success', {
        quantity: inventoryQty,
        packages: packageQty,
        cell: result.cellReference || selectedCell?.cellReference,
        warehouse: formData.warehouse_id.label
      }));

      // ✅ Refresh the products list to show updated remaining quantities
      if (formData.selected_entry_order?.entry_order_id) {
        await fetchEntryOrderProducts(formData.selected_entry_order.entry_order_id);
      }

      // ✅ Brief delay to show success message, then redirect to inventory page
      setTimeout(() => {
        navigate("/inventory");
      }, 1500);

    } catch (err: any) {
      console.error("Assignment error:", err);
      
      // ✅ Enhanced error handling with translations
      let errorMessage = t('inventory:assignment_failed');
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          try {
            errorMessage = JSON.stringify(err.response.data);
          } catch {
            errorMessage = t('inventory:server_error', { 
              status: err.response.status, 
              statusText: err.response.statusText 
            });
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  // ✅ Create dropdown options with translations
  const entryOrderOptions = approvedEntryOrders.map((order) => ({
    value: order.entry_order_id,
    label: `${order.entry_order_no} - ${order.organisation_name} (${order.products_needing_allocation} ${t('inventory:pending')})`,
  }));

  const productOptions = selectedOrderProducts.map((product) => ({
    value: product.entry_order_product_id,
    label: `${product.product.name} (${product.product.product_code}) - ${product.remaining_quantity} ${t('inventory:units_remaining')}`,
  }));

  const warehouseOptions = warehouses.map((wh: any) => ({
    value: wh.warehouse_id,
    label: wh.name,
  }));

  if (isLoadingWarehouses) {
    return (
      <div className="flex flex-col h-full">
        <Divider height="lg" />
        <LoaderSync loaderText={t('inventory:loading_warehouses')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ Consistent header layout with the rest of the app */}
      <Text size="3xl" weight="font-bold">
        {t('inventory:inventory_assignment')}
      </Text>
      <Divider height="lg" />

      {/* ✅ Error/Success Messages */}
      {error && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <Text additionalClass="text-red-800 text-sm">{error}</Text>
          </div>
        </>
      )}

      {success && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <Text additionalClass="text-green-800 text-sm">{success}</Text>
          </div>
        </>
      )}

      {/* ✅ Scrollable form content */}
      <div className="flex-1 overflow-y-auto">
        <form className="order_entry_form" onSubmit={handleSubmit}>
          {/* ✅ Product Selection Section - consistent with NewEntryOrderForm */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
              {t('inventory:product_selection')}
            </Text>
            
            <div className="w-full flex items-center gap-x-6">
              {/* Entry Order Selection */}
              <div className="w-full flex flex-col">
                <label htmlFor="entry_order">{t('process:entry_order')} *</label>
                <Select
                  options={entryOrderOptions}
                  styles={{
                    ...reactSelectStyle,
                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                  }}
                  inputId="entry_order"
                  name="entry_order"
                  value={formData.selected_entry_order ? {
                    value: formData.selected_entry_order.entry_order_id,
                    label: `${formData.selected_entry_order.entry_order_no} - ${formData.selected_entry_order.organisation_name}`
                  } : null}
                  onChange={handleEntryOrderSelect}
                  placeholder={t('inventory:select_entry_order')}
                  isClearable
                  isSearchable
                  menuPortalTarget={document.body}
                />
                <Text size="xs" additionalClass="text-gray-500 mt-1">
                  {t('inventory:approved_orders_available', { count: approvedEntryOrders.length })}
                </Text>
              </div>

              {/* Product Selection */}
              <div className="w-full flex flex-col">
                <label htmlFor="product">{t('process:product')} *</label>
                <Select
                  options={productOptions}
                  styles={{
                    ...reactSelectStyle,
                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                  }}
                  inputId="product"
                  name="product"
                  value={formData.selected_product ? {
                    value: formData.selected_product.entry_order_product_id,
                    label: `${formData.selected_product.product.name} (${formData.selected_product.product.product_code})`
                  } : null}
                  onChange={handleProductSelect}
                  placeholder={t('process:select_product')}
                  isClearable
                  isSearchable
                  isDisabled={!formData.selected_entry_order}
                  menuPortalTarget={document.body}
                />
                <Text size="xs" additionalClass="text-gray-500 mt-1">
                  {t('inventory:products_available', { count: selectedOrderProducts.length })}
                </Text>
              </div>
            </div>

            {/* Product Details */}
            {formData.selected_product && (
              <>
                <Divider height="sm" />
                <div className="bg-white p-3 rounded-md">
                  <Text weight="font-medium" additionalClass="mb-2 text-gray-800">
                    {t('inventory:product_details')}
                  </Text>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('process:serial_number')}</Text>
                      <Text weight="font-medium">{formData.selected_product.serial_number}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('process:lot_series')}</Text>
                      <Text weight="font-medium">{formData.selected_product.lot_series}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('inventory:remaining_quantity')}</Text>
                      <Text weight="font-medium" additionalClass="text-orange-600">
                        {formData.selected_product.remaining_quantity} / {formData.selected_product.inventory_quantity} {t('inventory:units')}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('inventory:remaining_packages')}</Text>
                      <Text weight="font-medium" additionalClass="text-orange-600">
                        {formData.selected_product.remaining_packaging_qty || Math.floor((formData.selected_product.package_quantity / formData.selected_product.inventory_quantity) * formData.selected_product.remaining_quantity)} / {formData.selected_product.package_quantity}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('inventory:remaining_weight')}</Text>
                      <Text weight="font-medium" additionalClass="text-orange-600">
                        {(formData.selected_product.remaining_weight || (formData.selected_product.weight_kg * formData.selected_product.remaining_quantity / formData.selected_product.inventory_quantity)).toFixed(2)} / {formData.selected_product.weight_kg} kg
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">{t('process:supplier')}</Text>
                      <Text weight="font-medium">{formData.selected_product.supplier?.name || formData.selected_product.supplier_name || "-"}</Text>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ✅ Warehouse & Cell Selection - consistent styling */}
          {formData.selected_product && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 relative z-0">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                {t('inventory:location_selection')}
              </Text>
              
              <div className="w-full flex items-center gap-x-6">
                {/* Warehouse Selection */}
                <div className="w-full flex flex-col">
                  <label htmlFor="warehouse">{t('inventory:warehouse')} *</label>
                  <Select
                    options={warehouseOptions}
                    styles={{
                      ...reactSelectStyle,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                    }}
                    inputId="warehouse"
                    name="warehouse"
                    value={formData.warehouse_id}
                    onChange={handleWarehouseChange}
                    placeholder={t('inventory:select_warehouse')}
                    isClearable
                    menuPortalTarget={document.body}
                  />
                </div>

                {/* Selected Cell Display */}
                {selectedCell && (
                  <div className="w-full flex flex-col">
                    <label>{t('inventory:selected_cell')}</label>
                    <div className="h-10 flex items-center px-4 bg-blue-50 border border-blue-200 rounded-md">
                      <Text weight="font-semibold" additionalClass="text-blue-900">
                        {selectedCell.cellReference || `${selectedCell.row}.${String(selectedCell.bay).padStart(2, "0")}.${String(selectedCell.position).padStart(2, "0")}`}
                      </Text>
                      <Text size="xs" additionalClass="text-blue-700 ml-2">
                        ({t('inventory:capacity')}: {selectedCell.capacity})
                      </Text>
                    </div>
                  </div>
                )}
              </div>

                            {/* Cell Grid */}
              {formData.warehouse_id && (
                <>
                  <Divider height="sm" />
                  <div className="relative z-0">
                    <Text weight="font-medium" additionalClass="mb-2">
                      {t('inventory:available_cells_in', { warehouse: formData.warehouse_id.label })}
                    </Text>
                    
                    {isLoadingCells ? (
                      <div className="flex justify-center py-8">
                        <LoaderSync loaderText={t('inventory:loading_cells')} />
                      </div>
                    ) : cells.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <Text additionalClass="text-gray-500">
                          {t('inventory:no_available_cells')}
                        </Text>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white relative">
                        <CellGrid
                          cells={cells}
                          onSelect={handleCellSelect}
                          selectedId={selectedCell?.cell_id}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ Assignment Details - consistent with NewEntryOrderForm */}
          {formData.selected_product && selectedCell && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                {t('inventory:assignment_details')}
              </Text>
              
              <div className="w-full flex items-center gap-x-6 mb-4">
                <div className="w-full flex flex-col">
                  <label htmlFor="inventory_quantity">{t('process:inventory_quantity')} *</label>
                  <input
                    type="number"
                    id="inventory_quantity"
                    name="inventory_quantity"
                    value={formData.inventory_quantity}
                    onChange={handleInputChange}
                    max={formData.selected_product.remaining_quantity || formData.selected_product.inventory_quantity}
                    min="1"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                  <Text size="xs" additionalClass="text-gray-500 mt-1">
                    {t('inventory:max')}: {formData.selected_product.remaining_quantity || formData.selected_product.inventory_quantity}
                  </Text>
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="package_quantity">{t('process:package_quantity')} *</label>
                  <input
                    type="number"
                    id="package_quantity"
                    name="package_quantity"
                    value={formData.package_quantity}
                    onChange={handleInputChange}
                    max={formData.selected_product.remaining_packaging_qty || formData.selected_product.package_quantity}
                    min="1"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                  <Text size="xs" additionalClass="text-gray-500 mt-1">
                    {t('inventory:max')}: {formData.selected_product.remaining_packaging_qty || Math.floor((formData.selected_product.package_quantity / formData.selected_product.inventory_quantity) * formData.selected_product.remaining_quantity)}
                  </Text>
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="quantity_pallets">{t('process:quantity_pallets')}</label>
                  <input
                    type="number"
                    id="quantity_pallets"
                    name="quantity_pallets"
                    value={formData.quantity_pallets}
                    onChange={handleInputChange}
                    min="0"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                  />
                </div>
              </div>

              <div className="w-full flex items-center gap-x-6 mb-4">
                <div className="w-full flex flex-col">
                  <label htmlFor="presentation">{t('process:presentation')} *</label>
                  <select
                    id="presentation"
                    name="presentation"
                    value={formData.presentation}
                    onChange={handleInputChange}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  >
                    {presentationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="weight_kg">{t('process:weight_kg')} *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="weight_kg"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    max={formData.selected_product.remaining_weight || formData.selected_product.weight_kg}
                    min="0.01"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                  <Text size="xs" additionalClass="text-gray-500 mt-1">
                    {t('inventory:max')}: {(formData.selected_product.remaining_weight || (formData.selected_product.weight_kg * formData.selected_product.remaining_quantity / formData.selected_product.inventory_quantity)).toFixed(2)} kg
                  </Text>
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="product_status">{t('inventory:product_status')} *</label>
                  <select
                    id="product_status"
                    name="product_status"
                    value={formData.product_status}
                    onChange={handleInputChange}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  >
                    {productStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Text size="xs" additionalClass="text-gray-500 mt-1">
                    {t('inventory:auto_synced_with_presentation')}
                  </Text>
                </div>
              </div>

              <div className="w-full flex items-center gap-x-6 mb-4">
                <div className="w-full flex flex-col">
                  <label htmlFor="guide_number">{t('process:guide_number')}</label>
                  <input
                    type="text"
                    id="guide_number"
                    name="guide_number"
                    value={formData.guide_number}
                    onChange={handleInputChange}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder={t('inventory:enter_guide_number')}
                  />
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="uploaded_documents">{t('inventory:document_upload')}</label>
                  <div className="flex items-center gap-x-2">
                    <input
                      type="text"
                      className="w-[60%] h-10 border border-slate-400 rounded-md px-4"
                      readOnly
                      value={
                        formData.uploaded_documents && formData.uploaded_documents.length > 0
                          ? t('inventory:files_selected', { count: formData.uploaded_documents.length })
                          : t('inventory:no_files_selected')
                      }
                    />
                    <input
                      type="file"
                      id="uploaded_documents"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('uploaded_documents')?.click()}
                    >
                      {t('inventory:choose_files')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col">
                <label htmlFor="observations">{t('process:observation')}</label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
                  placeholder={t('inventory:enter_observations')}
                />
              </div>
            </div>
          )}

          {/* ✅ Submit Section - consistent with the rest of the app */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="cancel"
              onClick={() => navigate(-1)}
              additionalClass="w-50"
              disabled={isAssigning}
            >
              {t('common:cancel')}
            </Button>

            <Button
              type="submit"
              disabled={!formData.selected_product || !selectedCell || isAssigning}
              variant="action"
              additionalClass="w-50"
            >
              {isAssigning ? t('inventory:assigning') : t('inventory:assign_to_inventory')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignProduct;