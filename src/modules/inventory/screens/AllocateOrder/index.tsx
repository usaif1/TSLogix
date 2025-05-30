/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useInventoryLogStore, ProductReadyForAssignment } from "@/modules/inventory/store";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { Button, Text, LoaderSync } from "@/components";
import CellGrid, { Cell } from "./components/CellGrid";

interface FormData {
  selected_product: ProductReadyForAssignment | null;
  warehouse_id: { value: string; label: string } | null;
  cell_id: string;
  packaging_quantity: string;
  weight: string;
  volume: string;
}

const AssignProduct: React.FC = () => {
  const navigate = useNavigate();
  const {
    warehouses,
    cells,
    productsReadyForAssignment,
    selectedProductForAssignment,
    loaders,
    setSelectedProductForAssignment,
  } = useInventoryLogStore();

  const [formData, setFormData] = useState<FormData>({
    selected_product: null,
    warehouse_id: null,
    cell_id: "",
    packaging_quantity: "",
    weight: "",
    volume: "",
  });

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLoadingWarehouses = loaders["inventoryLogs/fetch-warehouses"];
  const isLoadingCells = loaders["inventoryLogs/fetch-cells"];
  const isLoadingProducts = loaders["inventoryLogs/fetch-products-ready"];
  const isAssigning = loaders["inventoryLogs/assign-product-to-cell"];

  // Load initial data on mount
  useEffect(() => {
    InventoryLogService.fetchWarehouses();
    InventoryLogService.fetchProductsReadyForAssignment();
  }, []);

  // Load cells when warehouse is selected
  useEffect(() => {
    if (formData.warehouse_id?.value) {
      InventoryLogService.fetchAvailableCells(formData.warehouse_id.value);
    }
  }, [formData.warehouse_id?.value]);

  // Auto-select product if navigated from somewhere else
  useEffect(() => {
    if (selectedProductForAssignment && !formData.selected_product) {
      setFormData(prev => ({
        ...prev,
        selected_product: selectedProductForAssignment,
        packaging_quantity: selectedProductForAssignment.remaining_packaging_qty.toString(),
        weight: selectedProductForAssignment.remaining_weight.toString(),
      }));
    }
  }, [selectedProductForAssignment, formData.selected_product]);

  const handleProductSelect = (product: ProductReadyForAssignment) => {
    setFormData(prev => ({
      ...prev,
      selected_product: product,
      packaging_quantity: product.remaining_packaging_qty.toString(),
      weight: product.remaining_weight.toString(),
      // Reset warehouse and cell selection when changing product
      warehouse_id: null,
      cell_id: "",
      volume: "",
    }));
    setSelectedProductForAssignment(product);
    setSelectedCell(null);
    setError(null);
  };

  const handleWarehouseChange = (selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      warehouse_id: selectedOption,
      cell_id: "",
      volume: "",
    }));
    setSelectedCell(null);
    setError(null);
    setSuccess(null);
  };

  const handleCellSelect = (cell: Cell) => {
    setFormData(prev => ({ ...prev, cell_id: cell.cell_id }));
    setSelectedCell(cell);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.selected_product || !formData.warehouse_id?.value || !formData.cell_id || !formData.packaging_quantity || !formData.weight) {
      setError("Please fill in all required fields");
      return;
    }

    const packagingQty = parseInt(formData.packaging_quantity);
    const weight = parseFloat(formData.weight);

    if (packagingQty <= 0 || weight <= 0) {
      setError("Quantities must be greater than 0");
      return;
    }

    if (packagingQty > formData.selected_product.remaining_packaging_qty) {
      setError(`Cannot assign more than ${formData.selected_product.remaining_packaging_qty} packages`);
      return;
    }

    if (weight > formData.selected_product.remaining_weight) {
      setError(`Cannot assign more than ${formData.selected_product.remaining_weight} kg`);
      return;
    }

    try {
      const result = await InventoryLogService.assignProductToCell({
        entry_order_product_id: formData.selected_product.entry_order_product_id,
        cell_id: formData.cell_id,
        packaging_quantity: packagingQty,
        weight: weight,
        volume: formData.volume ? parseFloat(formData.volume) : undefined,
        warehouse_id: formData.warehouse_id.value,
      });

      setSuccess(`Successfully assigned ${packagingQty} packages to cell ${result.cellReference} in ${formData.warehouse_id.label}`);
      
      // Refresh products to show updated remaining quantities
      InventoryLogService.fetchProductsReadyForAssignment();
      
      // Reset form partially - keep product selected but reset assignment details
      setFormData(prev => ({
        ...prev,
        warehouse_id: null,
        cell_id: "",
        packaging_quantity: formData.selected_product?.remaining_packaging_qty.toString() || "",
        weight: formData.selected_product?.remaining_weight.toString() || "",
        volume: "",
      }));
      setSelectedCell(null);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign product to cell");
    }
  };

  const warehouseOptions = warehouses.map((wh: any) => ({
    value: wh.warehouse_id,
    label: wh.name,
  }));

  if (isLoadingWarehouses || isLoadingProducts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderSync loaderText="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Assign Product to Cell</h1>
          <Button onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <Text additionalClass="text-red-800">{error}</Text>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Text additionalClass="text-green-800">{success}</Text>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Products Selection - Step 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                Step 1: Select Product ({productsReadyForAssignment.length} available)
              </Text>
              
              {productsReadyForAssignment.length === 0 ? (
                <Text additionalClass="text-gray-500">
                  No products ready for assignment
                </Text>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                  {productsReadyForAssignment.map((product) => (
                    <div
                      key={product.entry_order_product_id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                        formData.selected_product?.entry_order_product_id === product.entry_order_product_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="space-y-2">
                        <Text weight="font-semibold" additionalClass="text-gray-800">
                          {product.product.name}
                        </Text>
                        <Text size="sm" additionalClass="text-gray-600">
                          Code: {product.product.product_code}
                        </Text>
                        <Text size="sm" additionalClass="text-gray-600">
                          Order: {product.entry_order.entry_order_no}
                        </Text>
                        <Text size="sm" additionalClass="text-gray-600">
                          Supplier: {product.entry_order.supplier.name}
                        </Text>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Available:</span>
                            <span className="font-medium">{product.remaining_packaging_qty} pkg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Weight:</span>
                            <span className="font-medium">{product.remaining_weight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium">{product.packaging_type}</span>
                          </div>
                        </div>
                        
                        {/* Show existing assignments */}
                        {product.cellAssignments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <Text size="xs" additionalClass="text-gray-500 mb-1">
                              Existing assignments:
                            </Text>
                            {product.cellAssignments.map((assignment) => (
                              <div key={assignment.assignment_id} className="text-xs text-gray-600">
                                {assignment.packaging_quantity} pkg in {assignment.cell.warehouse.name} 
                                (Cell {assignment.cell.row}.{String(assignment.cell.bay).padStart(2, '0')}.{String(assignment.cell.position).padStart(2, '0')})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warehouse Selection - Step 2 */}
            {formData.selected_product && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  Step 2: Select Warehouse
                </Text>
                <div className="w-full max-w-md">
                  <Select
                    options={warehouseOptions}
                    value={formData.warehouse_id}
                    onChange={handleWarehouseChange}
                    placeholder="Select warehouse..."
                    isClearable
                  />
                </div>
              </div>
            )}

            {/* Cell Selection - Step 3 */}
            {formData.selected_product && formData.warehouse_id && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  Step 3: Select Cell in {formData.warehouse_id.label}
                </Text>
                
                {isLoadingCells ? (
                  <div className="flex justify-center py-8">
                    <LoaderSync loaderText="Loading available cells..." />
                  </div>
                ) : cells.length === 0 ? (
                  <div className="text-center py-8">
                    <Text additionalClass="text-gray-500">
                      No available cells in this warehouse
                    </Text>
                  </div>
                ) : (
                  <CellGrid
                    cells={cells}
                    onSelect={handleCellSelect}
                    selectedId={selectedCell?.cell_id}
                  />
                )}
              </div>
            )}

            {/* Assignment Details - Step 4 */}
            {formData.selected_product && selectedCell && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  Step 4: Assignment Details
                </Text>
                
                {/* Selected Cell Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text weight="font-semibold" additionalClass="text-blue-900">
                        Selected Cell: {selectedCell.cellReference || `${selectedCell.row}.${String(selectedCell.bay).padStart(2, "0")}.${String(selectedCell.position).padStart(2, "0")}`}
                      </Text>
                      <Text size="sm" additionalClass="text-blue-700">
                        Capacity: {selectedCell.capacity} • Status: {selectedCell.status}
                      </Text>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packaging Quantity *
                    </label>
                    <input
                      type="number"
                      name="packaging_quantity"
                      value={formData.packaging_quantity}
                      onChange={handleInputChange}
                      max={formData.selected_product.remaining_packaging_qty}
                      min="1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <Text size="xs" additionalClass="text-gray-500 mt-1">
                      Max: {formData.selected_product.remaining_packaging_qty} packages
                    </Text>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      max={formData.selected_product.remaining_weight}
                      min="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <Text size="xs" additionalClass="text-gray-500 mt-1">
                      Max: {formData.selected_product.remaining_weight} kg
                    </Text>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume (m³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="volume"
                      value={formData.volume}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Text size="xs" additionalClass="text-gray-500 mt-1">
                      Optional
                    </Text>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => navigate("/inventory/logs")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAssigning}
                    className="min-w-[120px]"
                  >
                    {isAssigning ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Assigning...
                      </div>
                    ) : (
                      "Assign to Cell"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Bottom spacing for scroll */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default AssignProduct;