import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select, { SingleValue } from "react-select";
import { toast } from "sonner";

// Components
import { Button, Text } from "@/components";

// Store and Services
import { ClientService } from "@/modules/client/api/client.service";

interface Cell {
  id: string;
  row: string;
  bay: number;
  position: number;
  capacity: number;
  currentUsage: number;
  status: "AVAILABLE" | "OCCUPIED" | "DAMAGED" | "EXPIRED";
  cell_role: string;
  warehouse: {
    warehouse_id: string;
    name: string;
    location: string;
  };
}

interface Warehouse {
  warehouse_id: string;
  name: string;
  location?: string;
}

interface WarehouseCellSelectorProps {
  selectedCells: Cell[];
  onCellSelectionChange: (cells: Cell[]) => void;
  warehouseId: string | null;
  onWarehouseChange: (warehouseId: string | null) => void;
}

const WarehouseCellSelector: React.FC<WarehouseCellSelectorProps> = ({
  selectedCells,
  onCellSelectionChange,
  warehouseId,
  onWarehouseChange,
}) => {
  const { t } = useTranslation(['client', 'common']);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [availableCells, setAvailableCells] = useState<Cell[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCells, setIsLoadingCells] = useState(false);

  // Load warehouses on component mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        setIsLoadingWarehouses(true);
        const data = await ClientService.fetchWarehouses();
        setWarehouses(data || []);
      } catch (error) {
        console.error("Error loading warehouses:", error);
        toast.error("Failed to load warehouses");
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, []);

  // Load available cells when warehouse changes
  useEffect(() => {
    if (!warehouseId) {
      setAvailableCells([]);
      return;
    }

    const loadAvailableCells = async () => {
      try {
        setIsLoadingCells(true);
        const response = await ClientService.fetchAvailableCells(warehouseId);
        setAvailableCells(response.all_cells || []);
      } catch (error) {
        console.error("Error loading available cells:", error);
        toast.error("Failed to load available cells");
        setAvailableCells([]);
      } finally {
        setIsLoadingCells(false);
      }
    };

    loadAvailableCells();
  }, [warehouseId]);

  const formatCellReference = (cell: Cell): string => {
    return `${cell.row}.${String(cell.bay).padStart(2, "0")}.${String(cell.position).padStart(2, "0")}`;
  };

  const handleWarehouseSelect = (selectedOption: SingleValue<{ value: string; label: string }>) => {
    const newWarehouseId = selectedOption?.value || null;
    onWarehouseChange(newWarehouseId);
    // Clear selected cells when warehouse changes
    onCellSelectionChange([]);
  };

  const handleCellToggle = (cell: Cell) => {
    const isSelected = selectedCells.some(c => c.id === cell.id);
    
    if (isSelected) {
      // Remove cell from selection
      onCellSelectionChange(selectedCells.filter(c => c.id !== cell.id));
    } else {
      // Add cell to selection
      onCellSelectionChange([...selectedCells, cell]);
    }
  };

  const handleSelectAllCells = () => {
    onCellSelectionChange(availableCells);
  };

  const handleClearSelection = () => {
    onCellSelectionChange([]);
  };

  const getCellStatusColor = (cell: Cell, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-500 text-white border-blue-600";
    }
    
    switch (cell.status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
      case "OCCUPIED":
        return "bg-red-100 text-red-800 border-red-300 cursor-not-allowed";
      case "DAMAGED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
    }
  };

  const warehouseOptions = warehouses.map(warehouse => ({
    value: warehouse.warehouse_id,
    label: warehouse.name,
  }));

  const selectedWarehouse = warehouseOptions.find(option => option.value === warehouseId) || null;

  // Group cells by row for better display
  const cellsByRow = availableCells.reduce((acc, cell) => {
    if (!acc[cell.row]) {
      acc[cell.row] = [];
    }
    acc[cell.row].push(cell);
    return acc;
  }, {} as Record<string, Cell[]>);

  return (
    <div className="space-y-6">
      <div>
        <Text size="lg" weight="font-semibold" additionalClass="text-gray-800 mb-4">
          {t('client:cell_assignment.title')}
        </Text>
        <Text additionalClass="text-sm text-gray-600 mb-4">
          {t('client:cell_assignment.description')}
        </Text>
      </div>

      {/* Warehouse Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('client:cell_assignment.warehouse_label')}
        </label>
        <Select
          value={selectedWarehouse}
          onChange={handleWarehouseSelect}
          options={warehouseOptions}
          placeholder={t('client:cell_assignment.warehouse_placeholder')}
          isClearable
          isLoading={isLoadingWarehouses}
          className="w-full"
        />
      </div>

      {/* Cell Selection */}
      {warehouseId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text weight="font-medium" additionalClass="text-gray-800">
              {t('client:cell_assignment.available_cells')} ({availableCells.length})
            </Text>
            <div className="flex space-x-2">
              <Button
                variant="action"
                onClick={handleSelectAllCells}
                disabled={availableCells.length === 0}
                additionalClass="text-sm px-3 py-1"
              >
                {t('client:cell_assignment.select_all')}
              </Button>
              <Button
                variant="cancel"
                onClick={handleClearSelection}
                disabled={selectedCells.length === 0}
                additionalClass="text-sm px-3 py-1"
              >
                {t('client:cell_assignment.clear_selection')}
              </Button>
            </div>
          </div>

          {/* Selected Cells Summary */}
          {selectedCells.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Text weight="font-medium" additionalClass="text-blue-800 mb-2">
                {t('client:cell_assignment.selected_cells')} ({selectedCells.length}):
              </Text>
              <div className="flex flex-wrap gap-2">
                {selectedCells.map(cell => (
                  <span
                    key={cell.id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {formatCellReference(cell)}
                    <button
                      type="button"
                      onClick={() => handleCellToggle(cell)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cell Grid */}
          {isLoadingCells ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                <Text additionalClass="mt-2 text-sm">{t('common:loading')}</Text>
              </div>
            </div>
          ) : availableCells.length === 0 ? (
            <div className="text-center py-8">
              <Text additionalClass="text-gray-500">{t('client:cell_assignment.no_cells_available')}</Text>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(cellsByRow)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([row, cells]) => (
                    <div key={row} className="border-b border-gray-100 last:border-b-0">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <Text weight="font-medium" additionalClass="text-sm text-gray-700">
                          Row {row} ({cells.length} cells)
                        </Text>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1">
                          {cells
                            .sort((a, b) => a.bay - b.bay || a.position - b.position)
                            .map(cell => {
                              const isSelected = selectedCells.some(c => c.id === cell.id);
                              const isAvailable = cell.status === "AVAILABLE";
                              
                              return (
                                <button
                                  key={cell.id}
                                  type="button"
                                  onClick={() => isAvailable ? handleCellToggle(cell) : null}
                                  disabled={!isAvailable}
                                  className={`
                                    relative w-8 h-8 text-xs font-medium border rounded transition-colors
                                    ${getCellStatusColor(cell, isSelected)}
                                    ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                  `}
                                  title={`${formatCellReference(cell)} - ${cell.status} - Capacity: ${cell.capacity}`}
                                >
                                  {cell.bay}.{cell.position}
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>{t('client:cell_assignment.legend.available')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
              <span>{t('client:cell_assignment.legend.selected')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span>{t('client:cell_assignment.legend.occupied')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
              <span>{t('client:cell_assignment.legend.damaged')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseCellSelector; 