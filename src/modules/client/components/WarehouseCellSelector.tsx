import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select, { SingleValue } from "react-select";
import { toast } from "sonner";

// Components
import { Button, Text } from "@/components";

// Store and Services
import { ClientService } from "@/modules/client/api/client.service";
import { ClientStore } from "@/modules/client/store";

interface Cell {
  id: string;
  row: string;
  bay: number;
  position: number;
  capacity: number;
  currentUsage: number;
  status: "AVAILABLE" | "OCCUPIED" | "DAMAGED" | "EXPIRED";
  cell_role: string;
  is_passage: boolean;
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
  
  // Use store loaders instead of local state
  const isLoadingWarehouses = ClientStore.use.loaders()['clients/fetch-warehouses'];
  const isLoadingCells = ClientStore.use.loaders()['clients/fetch-available-cells'];
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [availableCells, setAvailableCells] = useState<Cell[]>([]);

  // Load warehouses on component mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await ClientService.fetchWarehouses();
        // Ensure data is always an array
        const warehouseList = Array.isArray(data) ? data : [];
        setWarehouses(warehouseList);
      } catch (error) {
        console.error("Error loading warehouses:", error);
        toast.error("Failed to load warehouses");
        // Set empty array on error to prevent map errors
        setWarehouses([]);
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
        const response = await ClientService.fetchAvailableCells(warehouseId);
        setAvailableCells(response.all_cells || []);
      } catch (error) {
        console.error("Error loading available cells:", error);
        toast.error("Failed to load available cells");
        setAvailableCells([]);
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
    // Prevent selection of passage cells
    if (cell.is_passage) {
      toast.error(t('client:cell_assignment.passage_cell_error'));
      return;
    }
    
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
    // Filter out passage cells from select all
    const selectableCells = availableCells.filter(cell => !cell.is_passage);
    onCellSelectionChange(selectableCells);
  };

  const handleClearSelection = () => {
    onCellSelectionChange([]);
  };

  const getCellStatusColor = (cell: Cell, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-500 text-white border-blue-600";
    }
    
    // Passage cells have a light gray background and are non-selectable
    if (cell.is_passage) {
      return "bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed";
    }
    
    if (cell.status === "OCCUPIED") {
      return "bg-gray-200 text-gray-800 border-gray-300 cursor-not-allowed";
    }
    
    if (cell.status === "AVAILABLE") {
      // Special rows have their own color schemes for available cells
      if (cell.row === "R") {
        return "bg-red-300 border-red-500 text-red-900 hover:bg-red-400";
      }
      if (cell.row === "T") {
        return "bg-purple-300 border-purple-500 text-purple-900 hover:bg-purple-400";
      }
      if (cell.row === "V") {
        return "bg-blue-300 border-blue-500 text-blue-900 hover:bg-blue-400";
      }
      
      // Regular rows and Q row use the original color scheme
      switch (cell.cell_role) {
        case "DAMAGED":
          return "bg-rose-200 border-rose-400 text-rose-800 hover:bg-rose-300";
        case "EXPIRED":
          return "bg-amber-200 border-amber-400 text-amber-800 hover:bg-amber-300";
        default:
          return "bg-emerald-400 border-emerald-500 text-emerald-900 hover:bg-emerald-500";
      }
    }
    
    return "bg-gray-100 text-gray-800 border-gray-300 cursor-not-allowed";
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

  // Sort rows to match warehouse grid: regular rows (A-P), then Q, then special rows (R, T, V)
  const sortedRows = Object.keys(cellsByRow).sort((a, b) => {
    const specialRows = ["Q", "R", "T", "V"];
    const aIsSpecial = specialRows.includes(a);
    const bIsSpecial = specialRows.includes(b);
    
    if (!aIsSpecial && !bIsSpecial) {
      // Both are regular rows, sort alphabetically
      return a.localeCompare(b);
    }
    
    if (!aIsSpecial && bIsSpecial) {
      // Regular row comes before special rows
      return -1;
    }
    
    if (aIsSpecial && !bIsSpecial) {
      // Special row comes after regular rows
      return 1;
    }
    
    // Both are special rows, sort in specific order: Q, R, T, V
    const specialOrder = { "Q": 0, "R": 1, "T": 2, "V": 3 };
    return specialOrder[a as keyof typeof specialOrder] - specialOrder[b as keyof typeof specialOrder];
  });

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
                {sortedRows.map((row) => {
                  const cells = cellsByRow[row];
                  const isSpecialRow = ["R", "T", "V"].includes(row);
                  
                  return (
                    <div key={row}>
                      {/* Add spacing before special sections */}
                      {(row === "Q" || row === "R") && (
                        <div className="h-3 bg-gray-50 border-b border-gray-100">
                          {row === "R" && (
                            <div className="text-center text-xs font-semibold text-gray-600 pt-1">
                              {t('client:cell_assignment.special_section')}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="border-b border-gray-100 last:border-b-0">
                        <div className={`px-3 py-2 border-b border-gray-200 ${isSpecialRow ? 'bg-blue-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <Text weight="font-medium" additionalClass={`text-sm ${isSpecialRow ? 'text-blue-800' : 'text-gray-700'}`}>
                              {t('client:cell_assignment.row')} {row} ({cells.length} {t('client:cell_assignment.cells')})
                              {isSpecialRow && (
                                <span className="ml-2 text-xs text-blue-600">
                                  {row === "R" ? `- ${t('client:cell_assignment.rejected')}` :
                                   row === "T" ? `- ${t('client:cell_assignment.samples')}` :
                                   row === "V" ? `- ${t('client:cell_assignment.returns')}` : ''}
                                </span>
                              )}
                            </Text>
                            <Text additionalClass="text-xs text-gray-500">
                              {cells.filter(c => c.status === "AVAILABLE").length} {t('client:cell_assignment.available')}
                            </Text>
                          </div>
                        </div>
                                                 <div className="p-3">
                           <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1">
                             {cells
                               .sort((a, b) => a.bay - b.bay || b.position - a.position)
                               .map(cell => {
                                 const isSelected = selectedCells.some(c => c.id === cell.id);
                                 const isAvailable = cell.status === "AVAILABLE" && !cell.is_passage;
                                 
                                 return (
                                   <button
                                     key={cell.id}
                                     type="button"
                                     onClick={() => isAvailable ? handleCellToggle(cell) : null}
                                     disabled={!isAvailable}
                                     className={`
                                       relative w-12 h-10 text-[8px] font-medium border rounded transition-colors overflow-hidden
                                       ${getCellStatusColor(cell, isSelected)}
                                       ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                     `}
                                     title={`${formatCellReference(cell)} - ${cell.status}${cell.is_passage ? ' - Passage' : ''} - ${t('client:cell_assignment.capacity')}: ${cell.capacity}`}
                                   >
                                     <div className="flex flex-col items-center justify-center h-full leading-none">
                                       {!cell.is_passage && (
                                         <span className="font-mono text-[7px] leading-none">
                                           {formatCellReference(cell)}
                                         </span>
                                       )}
                                     </div>
                                     {isSelected && (
                                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                         <span className="text-white text-[8px]">✓</span>
                                       </div>
                                     )}
                                   </button>
                                 );
                               })}
                           </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Legend */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <Text additionalClass="text-sm font-medium text-gray-700 mb-2">
              {t('client:cell_assignment.legend.title')}
            </Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <LegendItem color="bg-emerald-400" label={t('client:cell_assignment.legend.available')} />
              <LegendItem color="bg-blue-500" label={t('client:cell_assignment.legend.selected')} />
              <LegendItem color="bg-gray-200" label={t('client:cell_assignment.legend.occupied')} />
              <LegendItem color="bg-rose-200 border-rose-400" label={t('client:cell_assignment.legend.damaged')} />
              <LegendItem color="bg-amber-200 border-amber-400" label={t('client:cell_assignment.legend.expired')} />
              <LegendItem color="bg-red-300 border-red-500" label={`${t('client:cell_assignment.row')} R`} />
              <LegendItem color="bg-purple-300 border-purple-500" label={`${t('client:cell_assignment.row')} T`} />
              <LegendItem color="bg-blue-300 border-blue-500" label={`${t('client:cell_assignment.row')} V`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Legend Item Component
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className={`w-4 h-4 rounded-sm ${color}`}></div>
      <span>{label}</span>
    </div>
  );
}

export default WarehouseCellSelector; 