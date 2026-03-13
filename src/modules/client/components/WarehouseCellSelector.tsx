import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select, { SingleValue } from "react-select";
import { toast } from "sonner";
import clsx from "clsx";

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
    return formatId(cell.row, cell.bay, cell.position);
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

  // Get cell style matching WarehouseGrid exactly
  const getCellStyle = (cell: Cell | undefined, isSelected: boolean) => {
    if (!cell) return "bg-gray-100";

    // Selected cells override everything
    if (isSelected) {
      return "bg-blue-500 text-white border-blue-600";
    }

    // Passage cells have a light gray background for better visibility
    if (cell.is_passage) return "bg-gray-200 border-gray-400 text-gray-700";

    // Color based on cell role - different intensity for available vs occupied
    const isOccupied = cell.status === "OCCUPIED";

    switch (cell.cell_role) {
      case "STANDARD":
        return isOccupied
          ? "bg-emerald-200 border-emerald-300 text-emerald-800"
          : "bg-emerald-400 border-emerald-500 text-emerald-900";
      case "DAMAGED":
        return isOccupied
          ? "bg-rose-100 border-rose-200 text-rose-700"
          : "bg-rose-300 border-rose-500 text-rose-900";
      case "EXPIRED":
        return isOccupied
          ? "bg-amber-100 border-amber-200 text-amber-700"
          : "bg-amber-300 border-amber-500 text-amber-900";
      case "REJECTED":
        return isOccupied
          ? "bg-red-100 border-red-200 text-red-700"
          : "bg-red-300 border-red-500 text-red-900";
      case "SAMPLES":
        return isOccupied
          ? "bg-purple-100 border-purple-200 text-purple-700"
          : "bg-purple-300 border-purple-500 text-purple-900";
      case "RETURNS":
        return isOccupied
          ? "bg-blue-100 border-blue-200 text-blue-700"
          : "bg-blue-300 border-blue-500 text-blue-900";
      default:
        return isOccupied
          ? "bg-emerald-200 border-emerald-300 text-emerald-800"
          : "bg-emerald-400 border-emerald-500 text-emerald-900"; // Default to standard
    }
  };

  const formatId = (r: string, b: number, p: number) =>
    `${r}.${String(b).padStart(2, "0")}.${String(p).padStart(2, "0")}`;

  const warehouseOptions = warehouses.map(warehouse => ({
    value: warehouse.warehouse_id,
    label: warehouse.name,
  }));

  const selectedWarehouse = warehouseOptions.find(option => option.value === warehouseId) || null;

  // Sort rows to match warehouse grid: regular rows (A-P), then Q, then special rows (R, T, V)
  const rows = Array.from(new Set(availableCells.map((c) => c.row))).sort((a, b) => {
    const specialRows = ["Q", "R", "T", "V"];
    const aIsSpecial = specialRows.includes(a);
    const bIsSpecial = specialRows.includes(b);

    if (!aIsSpecial && !bIsSpecial) {
      return a.localeCompare(b);
    }
    if (!aIsSpecial && bIsSpecial) {
      return -1;
    }
    if (aIsSpecial && !bIsSpecial) {
      return 1;
    }
    const specialOrder = { "Q": 0, "R": 1, "T": 2, "V": 3 };
    return specialOrder[a as keyof typeof specialOrder] - specialOrder[b as keyof typeof specialOrder];
  });

  const bays = Array.from(new Set(availableCells.map((c) => c.bay))).sort((a, b) => a - b);

  // Get actual positions per row
  const getPositionsForRow = (row: string) => {
    const rowCells = availableCells.filter(c => c.row === row);
    return Array.from(new Set(rowCells.map(c => c.position))).sort((a, b) => b - a);
  };

  // Create lookup for quick cell access
  const lookup: Record<string, Record<number, Record<number, Cell>>> = {};
  availableCells.forEach((c) => {
    lookup[c.row] ||= {};
    lookup[c.row][c.bay] ||= {};
    lookup[c.row][c.bay][c.position] = c;
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

          {/* Cell Grid - Table Layout matching WarehouseGrid exactly */}
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
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Statistics */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-600 flex gap-4">
                  <span><strong>{t('client:cell_assignment.total_cells')}:</strong> {availableCells.filter(cell => !cell.is_passage).length}</span>
                  <span><strong>{t('client:cell_assignment.row')}s:</strong> {rows.length}</span>
                  <span><strong>Bays:</strong> {bays.length}</span>
                </div>
              </div>

              {/* Grid Table */}
              <div className="relative">
                <div className="max-h-[50vh] overflow-auto">
                  <table className="border-collapse text-xs w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="sticky left-0 top-0 bg-white z-10 p-1 border font-bold text-xs w-8">{t('client:cell_assignment.row')}</th>
                        {bays.map((bay) => (
                          <th
                            key={bay}
                            className={clsx(
                              "p-1 sticky top-0 bg-white border text-center font-bold text-xs",
                              "min-w-[2rem] sm:min-w-[2.5rem]"
                            )}
                          >
                            {String(bay).padStart(2, "0")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, ri) => {
                        const rowPositions = getPositionsForRow(row);
                        const hasMultiplePositions = rowPositions.length > 1;

                        return (
                          <React.Fragment key={row}>
                            {/* Add spacing before special sections */}
                            {(row === "Q" || row === "R") && (
                              <tr className="h-4">
                                <td colSpan={bays.length + 1} className="border-0 bg-gray-50">
                                  {row === "R" && (
                                    <div className="text-center text-xs font-semibold text-gray-600 pt-1">
                                      {t('client:cell_assignment.special_section')}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}

                            {/* Render only the positions that exist for this row */}
                            {rowPositions.map((pos, posIndex) => (
                              <tr key={`${row}-${pos}`}>
                                {/* Only render row label cell for first position */}
                                {posIndex === 0 && (
                                  <td
                                    className={clsx(
                                      "sticky left-0 bg-white border-r px-1 py-1 font-bold text-center",
                                      "w-8 max-w-8"
                                    )}
                                    rowSpan={hasMultiplePositions ? rowPositions.length : 1}
                                  >
                                    <div className="flex flex-col items-center justify-center h-full">
                                      <span className="text-sm font-bold leading-none">{row}</span>
                                      {hasMultiplePositions && (
                                        <span className="text-[10px] text-gray-500 leading-none">
                                          {rowPositions.length}P
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                )}

                                {bays.map((bay) => {
                                  const cell = lookup[row]?.[bay]?.[pos];
                                  const isSelected = cell ? selectedCells.some(c => c.id === cell.id) : false;
                                  const style = getCellStyle(cell, isSelected);
                                  const isAvailable = cell && cell.status === "AVAILABLE" && !cell.is_passage;

                                  return (
                                    <td
                                      key={`${row}-${bay}-${pos}`}
                                      className={clsx(
                                        "h-6 sm:h-8 border text-[7px] sm:text-[9px] text-center relative",
                                        "w-[1.8rem] sm:w-10 px-0.5",
                                        style,
                                        isAvailable && "cursor-pointer hover:opacity-80",
                                        !isAvailable && cell && "cursor-not-allowed"
                                      )}
                                      title={
                                        cell
                                          ? `${formatId(row, bay, pos)} - ${cell.cell_role} - ${cell.status}${cell.is_passage ? ' - Passage' : ''}`
                                          : `No cell at ${formatId(row, bay, pos)}`
                                      }
                                      onClick={() => cell && isAvailable && handleCellToggle(cell)}
                                    >
                                      {cell ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                          {!cell.is_passage && (
                                            <>
                                              <span className="font-mono">{formatId(row, bay, pos)}</span>
                                              {hasMultiplePositions && (
                                                <span className="text-[6px] sm:text-[8px] text-gray-600">P{pos}</span>
                                              )}
                                            </>
                                          )}
                                          {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                              <span className="text-white text-[8px]">✓</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                          —
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}

                            {/* Add spacing after special rows group */}
                            {row === "V" && (
                              <tr className="h-4">
                                <td colSpan={bays.length + 1} className="border-0 bg-gray-50"></td>
                              </tr>
                            )}

                            {/* Add separator between different rows (except for last row) */}
                            {ri < rows.length - 1 && (
                              <tr className="h-2">
                                <td className="bg-gray-200" colSpan={bays.length + 1}></td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Legend - matching WarehouseGrid */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <Text additionalClass="text-sm font-medium text-gray-700 mb-2">
              {t('client:cell_assignment.legend.title')}
            </Text>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-sm"></div>
                <span>{t('client:cell_assignment.legend.selected')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-emerald-400 border border-emerald-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-emerald-200 border border-emerald-300 rounded-r-sm"></div>
                </div>
                <span>Standard</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-rose-300 border border-rose-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded-r-sm"></div>
                </div>
                <span>{t('client:cell_assignment.legend.damaged')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-amber-300 border border-amber-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-r-sm"></div>
                </div>
                <span>{t('client:cell_assignment.legend.expired')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-red-300 border border-red-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-r-sm"></div>
                </div>
                <span>{t('client:cell_assignment.rejected')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-300 border border-purple-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-r-sm"></div>
                </div>
                <span>{t('client:cell_assignment.samples')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  <div className="w-3 h-3 bg-blue-300 border border-blue-500 rounded-l-sm"></div>
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-r-sm"></div>
                </div>
                <span>{t('client:cell_assignment.returns')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm"></div>
                <span>Passage</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseCellSelector; 