/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // ✅ Presentation options
  const presentationOptions = [
    { value: "PALETA", label: "PALETA" },
    { value: "CAJA", label: "CAJA" },
    { value: "SACO", label: "SACO" },
    { value: "UNIDAD", label: "UNIDAD" },
    { value: "PAQUETE", label: "PAQUETE" },
    { value: "TAMBOS", label: "TAMBOS" },
    { value: "BULTO", label: "BULTO" },
    { value: "OTRO", label: "OTRO" },
  ];

  // ✅ Product status options with enhanced labels
  const productStatusOptions = [
    // Normal statuses
    { value: "30-PAL-NORMAL", label: "30-PAL-NORMAL (Paleta Normal)" },
    { value: "31-CAJ-NORMAL", label: "31-CAJ-NORMAL (Caja Normal)" },
    { value: "32-SAC-NORMAL", label: "32-SAC-NORMAL (Saco Normal)" },
    { value: "33-UNI-NORMAL", label: "33-UNI-NORMAL (Unidad Normal)" },
    { value: "34-PAQ-NORMAL", label: "34-PAQ-NORMAL (Paquete Normal)" },
    { value: "35-TAM-NORMAL", label: "35-TAM-NORMAL (Tambo Normal)" },
    { value: "36-BUL-NORMAL", label: "36-BUL-NORMAL (Bulto Normal)" },
    { value: "37-OTR-NORMAL", label: "37-OTR-NORMAL (Otro Normal)" },
    
    // Damaged statuses
    { value: "40-PAL-DAÑADA", label: "40-PAL-DAÑADA (Paleta Dañada)" },
    { value: "41-CAJ-DAÑADA", label: "41-CAJ-DAÑADA (Caja Dañada)" },
    { value: "42-SAC-DAÑADO", label: "42-SAC-DAÑADO (Saco Dañado)" },
    { value: "43-UNI-DAÑADA", label: "43-UNI-DAÑADA (Unidad Dañada)" },
    { value: "44-PAQ-DAÑADO", label: "44-PAQ-DAÑADO (Paquete Dañado)" },
    { value: "45-TAM-DAÑADO", label: "45-TAM-DAÑADO (Tambo Dañado)" },
    { value: "46-BUL-DAÑADO", label: "46-BUL-DAÑADO (Bulto Dañado)" },
    { value: "47-OTR-DAÑADO", label: "47-OTR-DAÑADO (Otro Dañado)" },
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
      setError("Failed to load approved entry orders");
    }
  };

  // ✅ Fetch products for selected entry order
  const fetchEntryOrderProducts = async (entryOrderId: string) => {
    try {
      const response = await InventoryLogService.fetchEntryOrderProducts(entryOrderId);
      setSelectedOrderProducts(response.products);
    } catch (error) {
      console.error("Error fetching entry order products:", error);
      setError("Failed to load entry order products");
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
    
    setFormData(prev => ({
      ...prev,
      selected_product: product,
      inventory_quantity: product?.remaining_quantity?.toString() || product?.inventory_quantity?.toString() || "",
      package_quantity: product?.package_quantity?.toString() || "",
      quantity_pallets: "",
      presentation: product?.presentation || "PALETA",
      weight_kg: product?.weight_kg?.toString() || "",
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

    // ✅ Enhanced validation with better error messages
    const validationErrors: string[] = [];

    if (!formData.selected_product) {
      validationErrors.push("Please select a product");
    }
    if (!formData.warehouse_id?.value) {
      validationErrors.push("Please select a warehouse");
    }
    if (!formData.cell_id) {
      validationErrors.push("Please select a cell");
    }
    if (!formData.inventory_quantity || formData.inventory_quantity.trim() === "") {
      validationErrors.push("Inventory quantity is required");
    }
    if (!formData.package_quantity || formData.package_quantity.trim() === "") {
      validationErrors.push("Package quantity is required");
    }
    if (!formData.weight_kg || formData.weight_kg.trim() === "") {
      validationErrors.push("Weight is required");
    }
    if (!formData.presentation) {
      validationErrors.push("Presentation is required");
    }
    if (!formData.product_status) {
      validationErrors.push("Product status is required");
    }

    // ✅ Check if user is authenticated
    const userId = localStorage.getItem("id");
    if (!userId) {
      validationErrors.push("User not authenticated. Please log in again.");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    // ✅ Type guard to ensure we have required data before proceeding
    if (!formData.selected_product || !formData.warehouse_id) {
      setError("Missing required data. Please refresh and try again.");
      return;
    }

    const inventoryQty = parseInt(formData.inventory_quantity);
    const packageQty = parseInt(formData.package_quantity);
    const weight = parseFloat(formData.weight_kg);
    const pallets = formData.quantity_pallets ? parseInt(formData.quantity_pallets) : undefined;

    // ✅ Numeric validation
    if (isNaN(inventoryQty) || inventoryQty <= 0) {
      setError("Inventory quantity must be a number greater than 0");
      return;
    }
    if (isNaN(packageQty) || packageQty <= 0) {
      setError("Package quantity must be a number greater than 0");
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      setError("Weight must be a number greater than 0");
      return;
    }
    if (formData.quantity_pallets && (isNaN(pallets!) || pallets! < 0)) {
      setError("Quantity pallets must be a valid number");
      return;
    }

    const maxQuantity = formData.selected_product.remaining_quantity || formData.selected_product.inventory_quantity;
    if (inventoryQty > maxQuantity) {
      setError(`Cannot assign more than ${maxQuantity} units`);
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

      setSuccess(`Successfully assigned ${inventoryQty} units (${packageQty} packages) to cell ${result.cellReference || selectedCell?.cellReference} in ${formData.warehouse_id.label}`);

      // ✅ Refresh the products list to show updated remaining quantities
      if (formData.selected_entry_order?.entry_order_id) {
        await fetchEntryOrderProducts(formData.selected_entry_order.entry_order_id);
      }

      // ✅ Reset form but keep the entry order and product selected for additional assignments
      // Use the current product's remaining quantity after assignment
      const updatedProduct = selectedOrderProducts.find(p => 
        p.entry_order_product_id === formData.selected_product?.entry_order_product_id
      );
      
      setFormData(prev => ({
        ...prev,
        warehouse_id: null,
        cell_id: "",
        inventory_quantity: updatedProduct?.remaining_quantity?.toString() || 
                           formData.selected_product?.remaining_quantity?.toString() || "",
        package_quantity: updatedProduct?.package_quantity?.toString() || 
                         formData.selected_product?.package_quantity?.toString() || "",
        quantity_pallets: "",
        guide_number: "",
        observations: "",
        uploaded_documents: null,
      }));
      setSelectedCell(null);

    } catch (err: any) {
      console.error("Assignment error:", err);
      
      // ✅ Enhanced error handling
      let errorMessage = "Failed to assign product to cell";
      
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
            errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  // ✅ Create dropdown options
  const entryOrderOptions = approvedEntryOrders.map((order) => ({
    value: order.entry_order_id,
    label: `${order.entry_order_no} - ${order.organisation_name} (${order.products_needing_allocation} pending)`,
  }));

  const productOptions = selectedOrderProducts.map((product) => ({
    value: product.entry_order_product_id,
    label: `${product.product.name} (${product.product.product_code}) - ${product.remaining_quantity} units remaining`,
  }));

  const warehouseOptions = warehouses.map((wh: any) => ({
    value: wh.warehouse_id,
    label: wh.name,
  }));

  if (isLoadingWarehouses) {
    return (
      <div className="flex flex-col h-full">
        <Divider height="lg" />
        <LoaderSync loaderText="Loading warehouses..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ Consistent header layout with the rest of the app */}
      <Text size="3xl" weight="font-bold">
        Inventory Assignment
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
              Product Selection
            </Text>
            
            <div className="w-full flex items-center gap-x-6">
              {/* Entry Order Selection */}
              <div className="w-full flex flex-col">
                <label htmlFor="entry_order">Entry Order *</label>
                <Select
                  options={entryOrderOptions}
                  styles={reactSelectStyle}
                  inputId="entry_order"
                  name="entry_order"
                  value={formData.selected_entry_order ? {
                    value: formData.selected_entry_order.entry_order_id,
                    label: `${formData.selected_entry_order.entry_order_no} - ${formData.selected_entry_order.organisation_name}`
                  } : null}
                  onChange={handleEntryOrderSelect}
                  placeholder="Select entry order..."
                  isClearable
                  isSearchable
                />
                <Text size="xs" additionalClass="text-gray-500 mt-1">
                  {approvedEntryOrders.length} approved orders available
                </Text>
              </div>

              {/* Product Selection */}
              <div className="w-full flex flex-col">
                <label htmlFor="product">Product *</label>
                <Select
                  options={productOptions}
                  styles={reactSelectStyle}
                  inputId="product"
                  name="product"
                  value={formData.selected_product ? {
                    value: formData.selected_product.entry_order_product_id,
                    label: `${formData.selected_product.product.name} (${formData.selected_product.product.product_code})`
                  } : null}
                  onChange={handleProductSelect}
                  placeholder="Select product..."
                  isClearable
                  isSearchable
                  isDisabled={!formData.selected_entry_order}
                />
                <Text size="xs" additionalClass="text-gray-500 mt-1">
                  {selectedOrderProducts.length} products available
                </Text>
              </div>
            </div>

            {/* Product Details */}
            {formData.selected_product && (
              <>
                <Divider height="sm" />
                <div className="bg-white p-3 rounded-md">
                  <Text weight="font-medium" additionalClass="mb-2 text-gray-800">
                    Product Details
                  </Text>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">Serial Number</Text>
                      <Text weight="font-medium">{formData.selected_product.serial_number}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">Lot Series</Text>
                      <Text weight="font-medium">{formData.selected_product.lot_series}</Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">Remaining Quantity</Text>
                      <Text weight="font-medium" additionalClass="text-orange-600">
                        {formData.selected_product.remaining_quantity} units
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" additionalClass="text-gray-500">Supplier</Text>
                      <Text weight="font-medium">{formData.selected_product.supplier_name}</Text>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ✅ Warehouse & Cell Selection - consistent styling */}
          {formData.selected_product && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                Location Selection
              </Text>
              
              <div className="w-full flex items-center gap-x-6">
                {/* Warehouse Selection */}
                <div className="w-full flex flex-col">
                  <label htmlFor="warehouse">Warehouse *</label>
                  <Select
                    options={warehouseOptions}
                    styles={reactSelectStyle}
                    inputId="warehouse"
                    name="warehouse"
                    value={formData.warehouse_id}
                    onChange={handleWarehouseChange}
                    placeholder="Select warehouse..."
                    isClearable
                  />
                </div>

                {/* Selected Cell Display */}
                {selectedCell && (
                  <div className="w-full flex flex-col">
                    <label>Selected Cell</label>
                    <div className="h-10 flex items-center px-4 bg-blue-50 border border-blue-200 rounded-md">
                      <Text weight="font-semibold" additionalClass="text-blue-900">
                        {selectedCell.cellReference || `${selectedCell.row}.${String(selectedCell.bay).padStart(2, "0")}.${String(selectedCell.position).padStart(2, "0")}`}
                      </Text>
                      <Text size="xs" additionalClass="text-blue-700 ml-2">
                        (Capacity: {selectedCell.capacity})
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* Cell Grid */}
              {formData.warehouse_id && (
                <>
                  <Divider height="sm" />
                  <div>
                    <Text weight="font-medium" additionalClass="mb-2">
                      Available Cells in {formData.warehouse_id.label}
                    </Text>
                    
                    {isLoadingCells ? (
                      <div className="flex justify-center py-8">
                        <LoaderSync loaderText="Loading cells..." />
                      </div>
                    ) : cells.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <Text additionalClass="text-gray-500">
                          No available cells in this warehouse
                        </Text>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
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
                Assignment Details
              </Text>
              
              <div className="w-full flex items-center gap-x-6 mb-4">
                <div className="w-full flex flex-col">
                  <label htmlFor="inventory_quantity">Inventory Quantity *</label>
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
                    Max: {formData.selected_product.remaining_quantity || formData.selected_product.inventory_quantity}
                  </Text>
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="package_quantity">Package Quantity *</label>
                  <input
                    type="number"
                    id="package_quantity"
                    name="package_quantity"
                    value={formData.package_quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="quantity_pallets">Quantity Pallets</label>
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
                  <label htmlFor="presentation">Presentation *</label>
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
                  <label htmlFor="weight_kg">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="weight_kg"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    min="0.01"
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="product_status">Product Status *</label>
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
                    Auto-synced with presentation
                  </Text>
                </div>
              </div>

              <div className="w-full flex items-center gap-x-6 mb-4">
                <div className="w-full flex flex-col">
                  <label htmlFor="guide_number">Guide Number</label>
                  <input
                    type="text"
                    id="guide_number"
                    name="guide_number"
                    value={formData.guide_number}
                    onChange={handleInputChange}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder="Enter guide number..."
                  />
                </div>

                <div className="w-full flex flex-col">
                  <label htmlFor="uploaded_documents">Document Upload</label>
                  <input
                    type="file"
                    id="uploaded_documents"
                    multiple
                    onChange={handleFileUpload}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  {formData.uploaded_documents && formData.uploaded_documents.length > 0 && (
                    <Text size="xs" additionalClass="text-green-600 mt-1">
                      {formData.uploaded_documents.length} file(s) selected
                    </Text>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col">
                <label htmlFor="observations">Observations</label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
                  placeholder="Enter observations..."
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
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!formData.selected_product || !selectedCell || isAssigning}
              variant="action"
              additionalClass="w-50"
            >
              {isAssigning ? "Assigning..." : "Assign to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignProduct;