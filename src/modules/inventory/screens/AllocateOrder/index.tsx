/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useInventoryLogStore } from "@/modules/inventory/store";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { Button, Text, LoaderSync, Divider } from "@/components";

// ✅ NEW: Simplified interfaces for the new allocation flow
interface AllocationHelperResponse {
  can_proceed: boolean;
  entry_order: {
    entry_order_id: string;
    entry_order_no: string;
    organisation_name: string;
    created_by: string;
    registration_date: string;
  };
  products: Array<{
    entry_order_product_id: string;
    product: {
      product_id: string;
      product_code: string;
      name: string;
    };
    serial_number: string;
    lot_series: string;
    total_quantity: number;
    total_packages: number;
    total_weight: number;
    remaining_quantity: number;
    remaining_packages: number;
    remaining_weight: number;
    presentation: string;
    supplier_name: string;
  }>;
  warehouses: Array<{
    warehouse_id: string;
    name: string;
    available_cells: Array<{
      id: string; // ✅ Fixed: API returns 'id', not 'cell_id'
      cell_reference: string;
      row: string;
      bay: number;
      position: number;
      capacity: string | number; // ✅ Fixed: API returns string, we convert to number
      available_capacity: number;
      capacity_percentage: number;
      status: string;
      currentUsage: string | number;
      kind: string;
      cell_role: string;
      is_client_assigned?: boolean;
      client_assignment_info?: any;
    }>;
  }>;
  allocation_constraints?: {
    client_requirements?: string;
    temperature_control?: boolean;
    special_handling?: string;
  };
  validation_summary?: {
    blocking_issues: string[];
    warnings: string[];
    recommendations: string[];
  };
  // Additional fields that might be in the actual response
  allocation_summary?: any;
  constraints?: any;
}

interface AllocationRow {
  id: string;
  entry_order_product_id: string;
  product_name: string;
  product_code: string;
  remaining_quantity: number;
  remaining_packages: number;
  remaining_weight: number;
  // Allocation details
  warehouse_id: string;
  cell_id: string;
  inventory_quantity: number;
  package_quantity: number;
  weight_kg: number;
  volume_m3: number;
  presentation: string;
  product_status: string;
  status_code: number;
  guide_number: string;
  observations: string;
  // UI state
  isValid: boolean;
  errors: string[];
}

interface BulkAllocationRequest {
  entry_order_id: string;
  allocations: Array<{
    entry_order_product_id: string;
    cell_id: string;
    warehouse_id: string;
    inventory_quantity: number;
    package_quantity: number;
    weight_kg: number;
    volume_m3: number;
    presentation: string;
    product_status: string;
    status_code: number;
    guide_number?: string;
    observations?: string;
  }>;
  notes?: string;
  force_complete_allocation: boolean;
}

const SimplifiedInventoryAllocation: React.FC = () => {
  const { t } = useTranslation(['inventory', 'common', 'process']);
  const navigate = useNavigate();
  const { loaders } = useInventoryLogStore();

  // State management
  const [entryOrders, setEntryOrders] = useState<any[]>([]);
  const [selectedEntryOrder, setSelectedEntryOrder] = useState<{ value: string; label: string } | null>(null);
  const [allocationData, setAllocationData] = useState<AllocationHelperResponse | null>(null);
  const [allocationRows, setAllocationRows] = useState<AllocationRow[]>([]);
  const [notes, setNotes] = useState("");
  const [forceComplete, setForceComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLoadingHelper = loaders["inventoryLogs/fetch-allocation-helper"];
  const isSubmitting = loaders["inventoryLogs/bulk-assign"];

  // ✅ Presentation options
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

  // ✅ Product status options
  const productStatusOptions = [
    { value: "PAL_NORMAL", label: "PAL-NORMAL", code: 30 },
    { value: "CAJ_NORMAL", label: "CAJ-NORMAL", code: 31 },
    { value: "SAC_NORMAL", label: "SAC-NORMAL", code: 32 },
    { value: "UNI_NORMAL", label: "UNI-NORMAL", code: 33 },
    { value: "PAQ_NORMAL", label: "PAQ-NORMAL", code: 34 },
    { value: "TAM_NORMAL", label: "TAM-NORMAL", code: 35 },
    { value: "BUL_NORMAL", label: "BUL-NORMAL", code: 36 },
    { value: "OTR_NORMAL", label: "OTR-NORMAL", code: 37 },
    { value: "PAL_DAMAGED", label: "PAL-DAÑADA", code: 40 },
    { value: "CAJ_DAMAGED", label: "CAJ-DAÑADA", code: 41 },
    { value: "SAC_DAMAGED", label: "SAC-DAÑADO", code: 42 },
    { value: "UNI_DAMAGED", label: "UNI-DAÑADA", code: 43 },
    { value: "PAQ_DAMAGED", label: "PAQ-DAÑADO", code: 44 },
    { value: "TAM_DAMAGED", label: "TAM-DAÑADO", code: 45 },
    { value: "BUL_DAMAGED", label: "BUL-DAÑADO", code: 46 },
    { value: "OTR_DAMAGED", label: "OTR-DAÑADO", code: 47 },
  ];

  // Load approved entry orders on mount
  useEffect(() => {
    const fetchEntryOrders = async () => {
      try {
        const response = await InventoryLogService.fetchApprovedEntryOrders();
        setEntryOrders(response);
      } catch (error) {
        console.error("Error fetching entry orders:", error);
        setError(t('inventory:failed_to_load_entry_orders'));
      }
    };
    fetchEntryOrders();
  }, [t]);

  // ✅ Step 1: Fetch allocation helper data
  const fetchAllocationHelper = useCallback(async (entryOrderId: string) => {
    try {
      setError(null);
      console.log("🔄 Starting fetchAllocationHelper for entry order:", entryOrderId);
      
      const response = await InventoryLogService.fetchAllocationHelper(entryOrderId);
      console.log("📦 Allocation helper response received:", response);
      
      setAllocationData(response);

      // Initialize allocation rows from products
      const initialRows: AllocationRow[] = response.products.map((product: any, index: number) => ({
        id: `${product.entry_order_product_id}-${index}`,
        entry_order_product_id: product.entry_order_product_id,
        product_name: product.product?.name || product.product_name || "Unknown Product",
        product_code: product.product?.product_code || product.product_code || "Unknown Code",
        remaining_quantity: product.remaining_quantity || 0,
        remaining_packages: product.remaining_packages || 0,
        remaining_weight: product.remaining_weight || 0,
        warehouse_id: "",
        cell_id: "",
        inventory_quantity: 0,
        package_quantity: 0,
        weight_kg: 0,
        volume_m3: 0,
        presentation: product.presentation || "PALETA",
        product_status: "PAL_NORMAL",
        status_code: 30,
        guide_number: "",
        observations: "",
        isValid: false,
        errors: []
      }));

      console.log("📋 Initial allocation rows created:", initialRows);
      setAllocationRows(initialRows);

      // Show validation issues
      if (!response.can_proceed) {
        const blockingIssues = response.validation_summary?.blocking_issues || [];
        const errorMsg = `Cannot proceed: ${blockingIssues.join(", ")}`;
        console.error("❌ Validation blocking issues:", blockingIssues);
        setError(errorMsg);
      }
      
      // Check for warnings if validation_summary exists
      if (response.validation_summary?.warnings && response.validation_summary.warnings.length > 0) {
        console.warn("⚠️ Allocation warnings:", response.validation_summary.warnings);
      }

      console.log("✅ Allocation helper setup completed successfully");

    } catch (error: any) {
      console.error("❌ Error in fetchAllocationHelper:", error);
      setError(error.message || t('inventory:failed_to_load_allocation_data'));
    }
  }, [t]);

  // Handle entry order selection
  const handleEntryOrderSelect = useCallback((selectedOption: any) => {
    setSelectedEntryOrder(selectedOption);
    setAllocationData(null);
    setAllocationRows([]);
    setError(null);
    setSuccess(null);

    if (selectedOption?.value) {
      fetchAllocationHelper(selectedOption.value);
    }
  }, [fetchAllocationHelper]);

  // ✅ Validate a single allocation row
  const validateRow = useCallback((row: AllocationRow): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!row.warehouse_id) errors.push("Warehouse required");
    if (!row.cell_id) errors.push("Cell required");
    if (row.inventory_quantity <= 0) errors.push("Quantity must be > 0");
    if (row.inventory_quantity > row.remaining_quantity) errors.push("Quantity exceeds remaining");
    if (row.package_quantity <= 0) errors.push("Packages must be > 0");
    if (row.package_quantity > row.remaining_packages) errors.push("Packages exceed remaining");
    if (row.weight_kg <= 0) errors.push("Weight must be > 0");
    if (row.weight_kg > row.remaining_weight) errors.push("Weight exceeds remaining");

    // Check cell capacity if we have the data
    if (allocationData && row.cell_id) {
      const warehouse = allocationData.warehouses.find(w => w.warehouse_id === row.warehouse_id);
      const cell = warehouse?.available_cells.find(c => c.id === row.cell_id);
      if (cell && row.inventory_quantity > cell.available_capacity) {
        errors.push("Exceeds cell capacity");
      }
    }

    return { isValid: errors.length === 0, errors };
  }, [allocationData]);

  // ✅ Update a specific row
  const updateRow = useCallback((rowId: string, updates: Partial<AllocationRow>) => {
    console.log("🔄 updateRow called:", { rowId, updates });
    
    setAllocationRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, ...updates };
        
        console.log("📝 Updating row:", {
          rowId,
          oldWarehouseId: row.warehouse_id,
          newWarehouseId: updatedRow.warehouse_id,
          updates
        });
        
        // Auto-sync presentation with product status
        if (updates.presentation) {
          const statusMap: Record<string, { value: string; code: number }> = {
            "PALETA": { value: "PAL_NORMAL", code: 30 },
            "CAJA": { value: "CAJ_NORMAL", code: 31 },
            "SACO": { value: "SAC_NORMAL", code: 32 },
            "UNIDAD": { value: "UNI_NORMAL", code: 33 },
            "PAQUETE": { value: "PAQ_NORMAL", code: 34 },
            "TAMBOS": { value: "TAM_NORMAL", code: 35 },
            "BULTO": { value: "BUL_NORMAL", code: 36 },
            "OTRO": { value: "OTR_NORMAL", code: 37 },
          };
          const statusInfo = statusMap[updates.presentation];
          if (statusInfo) {
            updatedRow.product_status = statusInfo.value;
            updatedRow.status_code = statusInfo.code;
          }
        }

        // Validate the updated row
        const validation = validateRow(updatedRow);
        updatedRow.isValid = validation.isValid;
        updatedRow.errors = validation.errors;

        console.log("✅ Row updated:", {
          rowId,
          warehouse_id: updatedRow.warehouse_id,
          cell_id: updatedRow.cell_id,
          isValid: updatedRow.isValid,
          errors: updatedRow.errors
        });

        return updatedRow;
      }
      return row;
    }));
  }, [validateRow]);

  // ✅ Add a new allocation row for splitting products
  const addAllocationRow = useCallback((sourceRowId: string) => {
    const sourceRow = allocationRows.find(r => r.id === sourceRowId);
    if (!sourceRow) return;

    const newRow: AllocationRow = {
      ...sourceRow,
      id: `${sourceRow.entry_order_product_id}-${Date.now()}`,
      inventory_quantity: 0,
      package_quantity: 0,
      weight_kg: 0,
      volume_m3: 0,
      warehouse_id: "",
      cell_id: "",
      guide_number: "",
      observations: "",
      isValid: false,
      errors: []
    };

    setAllocationRows(prev => {
      const index = prev.findIndex(r => r.id === sourceRowId);
      const newRows = [...prev];
      newRows.splice(index + 1, 0, newRow);
      return newRows;
    });
  }, [allocationRows]);

  // ✅ Remove an allocation row
  const removeAllocationRow = useCallback((rowId: string) => {
    setAllocationRows(prev => prev.filter(r => r.id !== rowId));
  }, []);

  // ✅ Step 2: Submit bulk allocation
  const handleSubmitAllocation = useCallback(async () => {
    if (!allocationData || !selectedEntryOrder) return;

    // Filter valid rows with quantities > 0
    const validRows = allocationRows.filter(row => row.isValid && row.inventory_quantity > 0);
    
    if (validRows.length === 0) {
      setError("No valid allocations to submit");
      return;
    }

    const request: BulkAllocationRequest = {
      entry_order_id: allocationData.entry_order.entry_order_id,
      allocations: validRows.map(row => ({
        entry_order_product_id: row.entry_order_product_id,
        cell_id: row.cell_id,
        warehouse_id: row.warehouse_id,
        inventory_quantity: row.inventory_quantity,
        package_quantity: row.package_quantity,
        weight_kg: row.weight_kg,
        volume_m3: row.volume_m3,
        presentation: row.presentation,
        product_status: row.product_status,
        status_code: row.status_code,
        guide_number: row.guide_number || undefined,
        observations: row.observations || undefined,
      })),
      notes: notes || undefined,
      force_complete_allocation: forceComplete,
    };

    try {
      setError(null);
      const response = await InventoryLogService.bulkAssignEntryOrder(request);
      
      console.log("✅ Bulk allocation response:", response);
      
      // Map the actual API response structure
      const allocationsCount = response.allocations?.length || response.allocations_created || 0;
      const cellsOccupied = response.cells_occupied?.length || response.cells_occupied || 0;
      const allocationPercentage = response.allocation_percentage || 0;
      const isFullyAllocated = response.is_fully_allocated || false;
      const totalQuantity = response.summary?.total_quantity_allocated || 0;
      const totalPackages = response.summary?.total_packages_allocated || 0;
      const totalWeight = response.summary?.total_weight_allocated || 0;
      const warehousesUsed = response.warehouses_used?.length || 1;
      
      // Create comprehensive success message
      const successMessage = `
        🎉 ${response.message || t('inventory:allocation_success_title')}
        
        📊 ${t('inventory:allocation_summary')}
        • ${allocationsCount} ${t('inventory:allocations_created')}
        • ${cellsOccupied} ${t('inventory:cells_occupied')}  
        • ${totalQuantity} ${t('inventory:units_allocated')}
        • ${totalPackages} ${t('inventory:packages_allocated')}
        • ${totalWeight}kg ${t('inventory:total_weight')}
        • ${warehousesUsed} ${t('inventory:warehouses_used')}
        • ${allocationPercentage}% ${t('inventory:allocation_progress')}
        
        ${isFullyAllocated ? '✅ ' + t('inventory:fully_allocated') : '⚠️ ' + t('inventory:partial_allocation')}
      `.trim();
      
      setSuccess(successMessage);
      
      // Navigate to inventory after successful allocation
      setTimeout(() => {
        navigate("/inventory");
      }, 3000); // Increased time to read the detailed message

    } catch (error: any) {
      console.error("Bulk allocation error:", error);
      setError(error.message || "Failed to submit allocation");
    }
  }, [allocationData, selectedEntryOrder, allocationRows, notes, forceComplete, navigate]);

  // ✅ Get warehouse and cell options for dropdowns
  const getWarehouseOptions = useCallback(() => {
    if (!allocationData?.warehouses?.length) {
      console.log("🔍 No allocation data or warehouses available");
      return [];
    }
    
    const options = allocationData.warehouses.map(w => ({ 
      value: w.warehouse_id || '', 
      label: w.name || 'Unknown' 
    }));
    console.log("🏪 Warehouse options:", options);
    return options;
  }, [allocationData]);

  const getCellOptions = useCallback((warehouseId: string) => {
    if (!allocationData?.warehouses?.length) {
      console.log("🔍 No allocation data available for cell options");
      return [];
    }
    
    if (!warehouseId) {
      console.log("🔍 No warehouse ID provided for cell options");
      return [];
    }
    
    const warehouse = allocationData.warehouses.find(w => w.warehouse_id === warehouseId);
    console.log("🏪 Looking for warehouse:", warehouseId, "Found:", warehouse?.name || 'Not found');
    
    if (!warehouse?.available_cells?.length) {
      console.log("🔍 No warehouse found or no available cells for warehouse:", warehouseId);
      return [];
    }
    
    // Debug the actual cell data structure
    console.log("🔍 Raw cell data sample:", warehouse.available_cells[0]);
    
    const options = warehouse.available_cells.map((cell: any, index) => {
      // Fix: Use 'id' instead of 'cell_id' based on the actual API response
      const cellId = cell.id || cell.cell_id || `temp-cell-${warehouseId}-${index}`;
      const cellRef = cell.cell_reference || `Cell-${index + 1}`;
      const availableCap = cell.available_capacity || 0;
      const totalCap = Number(cell.capacity) || 100;
      
      console.log("🔍 Processing cell:", { 
        index,
        original_id: cell.id,
        original_cell_id: cell.cell_id,
        original_reference: cell.cell_reference,
        final_cellId: cellId, 
        final_cellRef: cellRef, 
        availableCap, 
        totalCap 
      });
      
      return { 
        value: cellId, 
        label: `${cellRef} (${availableCap}/${totalCap})` 
      };
    });
    
    console.log("🏠 Cell options for warehouse", warehouseId, ":", options);
    return options;
  }, [allocationData]);

  // Entry order options
  const entryOrderOptions = entryOrders.map(order => ({
    value: order.entry_order_id,
    label: `${order.entry_order_no} - ${order.organisation_name} (${order.products_needing_allocation || 0} pending)`
  }));

  const validRowsCount = allocationRows.filter(row => row.isValid && row.inventory_quantity > 0).length;
  const totalAllocationQuantity = allocationRows.reduce((sum, row) => sum + (row.inventory_quantity || 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Text size="3xl" weight="font-bold">
        {t('inventory:simplified_allocation')}
      </Text>
      <Text size="sm" additionalClass="text-gray-600 mb-4">
        Excel-like interface for streamlined inventory allocation
      </Text>
      <Divider height="lg" />

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <Text additionalClass="text-red-800 text-sm">{error}</Text>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="text-green-800 text-sm whitespace-pre-line font-mono">
            {success}
          </div>
        </div>
      )}

      {/* Entry Order Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
          {t('inventory:step_1_select_entry_order')}
        </Text>
        
        <div className="w-full max-w-md">
          <label htmlFor="entry_order">{t('process:entry_order')} *</label>
          <Select
            options={entryOrderOptions}
            value={selectedEntryOrder}
            onChange={handleEntryOrderSelect}
            placeholder={t('inventory:select_entry_order')}
            isClearable
            isSearchable
            className="mt-1"
          />
          <Text size="xs" additionalClass="text-gray-500 mt-1">
            {t('inventory:approved_orders_available', { count: entryOrders.length })}
          </Text>
        </div>

        {allocationData && (
          <div className="mt-4 p-3 bg-white rounded border">
            <Text weight="font-medium" additionalClass="mb-2">
              {allocationData.entry_order.entry_order_no} - {allocationData.entry_order.organisation_name}
            </Text>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Text size="xs" additionalClass="text-gray-500">Products</Text>
                <Text weight="font-medium">{allocationData.products.length}</Text>
              </div>
              <div>
                <Text size="xs" additionalClass="text-gray-500">Warehouses Available</Text>
                <Text weight="font-medium">{allocationData.warehouses.length}</Text>
              </div>
              <div>
                <Text size="xs" additionalClass="text-gray-500">Can Proceed</Text>
                <Text weight="font-medium" additionalClass={allocationData.can_proceed ? "text-green-600" : "text-red-600"}>
                  {allocationData.can_proceed ? "Yes" : "No"}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingHelper && (
        <div className="flex justify-center py-8">
          <LoaderSync loaderText={t('inventory:loading_allocation_data')} />
        </div>
      )}

      {/* Excel-like Allocation Table */}
      {allocationData && allocationRows.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Text size="lg" weight="font-semibold">
                  {t('inventory:step_2_allocation_planning')}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">
                  {validRowsCount} valid allocations • {totalAllocationQuantity} total units
                </Text>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="cancel"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  variant="action"
                  onClick={handleSubmitAllocation}
                  disabled={validRowsCount === 0 || isSubmitting}
                >
                  {isSubmitting ? t('inventory:submitting') : `${t('inventory:allocate')} (${validRowsCount})`}
                </Button>
              </div>
            </div>
          </div>

          {/* Excel-like Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse table-fixed" style={{ minWidth: '1400px' }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-8 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">#</th>
                  <th className="w-48 p-2 border-r border-gray-200 text-left text-xs font-medium text-gray-600">Product</th>
                  <th className="w-24 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Remaining</th>
                  <th className="w-32 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Warehouse</th>
                  <th className="w-32 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Cell</th>
                  <th className="w-20 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Quantity</th>
                  <th className="w-20 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Packages</th>
                  <th className="w-20 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Weight</th>
                  <th className="w-24 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Presentation</th>
                  <th className="w-28 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Status</th>
                  <th className="w-24 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Guide #</th>
                  <th className="w-32 p-2 border-r border-gray-200 text-xs font-medium text-gray-600">Notes</th>
                  <th className="w-16 p-2 text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocationRows.map((row, index) => (
                  <tr key={row.id} className={`border-b border-gray-100 ${!row.isValid && row.inventory_quantity > 0 ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    {/* Row Number */}
                    <td className="p-1 border-r border-gray-200 text-center text-xs text-gray-500">
                      {index + 1}
                    </td>

                    {/* Product Info */}
                    <td className="p-1 border-r border-gray-200">
                      <div className="text-xs">
                        <div className="font-medium truncate" title={row.product_name}>{row.product_name}</div>
                        <div className="text-gray-500">{row.product_code}</div>
                      </div>
                    </td>

                    {/* Remaining Quantities */}
                    <td className="p-1 border-r border-gray-200 text-xs text-center">
                      <div>{row.remaining_quantity}</div>
                      <div className="text-gray-500">{row.remaining_packages}p</div>
                      <div className="text-gray-500">{row.remaining_weight.toFixed(1)}kg</div>
                    </td>

                    {/* Warehouse Selection */}
                    <td className="p-1 border-r border-gray-200">
                      <Select
                        options={getWarehouseOptions()}
                        value={getWarehouseOptions().find(option => option.value === row.warehouse_id) || null}
                        onChange={(option) => {
                          console.log("🏪 Warehouse selected:", option);
                          updateRow(row.id, { warehouse_id: option?.value || '', cell_id: '' });
                        }}
                        placeholder="Select..."
                        isClearable
                        isSearchable={false}
                        className="text-xs"
                        styles={{
                          control: (base) => ({ ...base, minHeight: '28px', fontSize: '12px' }),
                          option: (base) => ({ ...base, fontSize: '12px' }),
                        }}
                      />
                    </td>

                    {/* Cell Selection */}
                    <td className="p-1 border-r border-gray-200">
                      <Select
                        options={getCellOptions(row.warehouse_id)}
                        value={getCellOptions(row.warehouse_id).find(option => option.value === row.cell_id) || null}
                        onChange={(option) => {
                          console.log("🏠 Cell selected:", option);
                          updateRow(row.id, { cell_id: option?.value || '' });
                        }}
                        placeholder="Select..."
                        isClearable
                        isSearchable={false}
                        isDisabled={!row.warehouse_id}
                        className="text-xs"
                        styles={{
                          control: (base) => ({ ...base, minHeight: '28px', fontSize: '12px' }),
                          option: (base) => ({ ...base, fontSize: '12px' }),
                        }}
                      />
                    </td>

                    {/* Quantity Input */}
                    <td className="p-1 border-r border-gray-200">
                      <input
                        type="number"
                        min="0"
                        max={row.remaining_quantity}
                        value={row.inventory_quantity || ''}
                        onChange={(e) => updateRow(row.id, { inventory_quantity: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Package Quantity Input */}
                    <td className="p-1 border-r border-gray-200">
                      <input
                        type="number"
                        min="0"
                        max={row.remaining_packages}
                        value={row.package_quantity || ''}
                        onChange={(e) => updateRow(row.id, { package_quantity: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Weight Input */}
                    <td className="p-1 border-r border-gray-200">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={row.remaining_weight}
                        value={row.weight_kg || ''}
                        onChange={(e) => updateRow(row.id, { weight_kg: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Presentation Selection */}
                    <td className="p-1 border-r border-gray-200">
                      <select
                        value={row.presentation}
                        onChange={(e) => updateRow(row.id, { presentation: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        {presentationOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Product Status Selection */}
                    <td className="p-1 border-r border-gray-200">
                      <select
                        value={row.product_status}
                        onChange={(e) => {
                          const status = productStatusOptions.find(s => s.value === e.target.value);
                          updateRow(row.id, { 
                            product_status: e.target.value,
                            status_code: status?.code || 30
                          });
                        }}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        {productStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Guide Number Input */}
                    <td className="p-1 border-r border-gray-200">
                      <input
                        type="text"
                        value={row.guide_number}
                        onChange={(e) => updateRow(row.id, { guide_number: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                        placeholder="Optional"
                      />
                    </td>

                    {/* Observations Input */}
                    <td className="p-1 border-r border-gray-200">
                      <input
                        type="text"
                        value={row.observations}
                        onChange={(e) => updateRow(row.id, { observations: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                        placeholder="Notes..."
                      />
                    </td>

                    {/* Actions */}
                    <td className="p-1 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => addAllocationRow(row.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Split allocation"
                        >
                          +
                        </button>
                        {allocationRows.filter(r => r.entry_order_product_id === row.entry_order_product_id).length > 1 && (
                          <button
                            onClick={() => removeAllocationRow(row.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                            title="Remove allocation"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {!row.isValid && row.inventory_quantity > 0 && (
                        <div className="text-xs text-red-600 mt-1" title={row.errors.join(', ')}>
                          ⚠
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Summary and Options */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">{validRowsCount}</span> valid allocations
                </div>
                <div className="text-sm">
                  <span className="font-medium">{totalAllocationQuantity}</span> total units
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={forceComplete}
                    onChange={(e) => setForceComplete(e.target.checked)}
                  />
                  Force complete allocation
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this allocation..."
                  className="text-sm border border-gray-300 rounded px-3 py-1 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedInventoryAllocation;