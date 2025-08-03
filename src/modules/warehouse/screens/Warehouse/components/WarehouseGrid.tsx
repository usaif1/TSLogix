import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useWarehouseCellStore, {
  WarehouseCell,
} from "@/modules/warehouse/store";
import { WarehouseCellService } from "@/modules/warehouse/api/warehouse.service";

interface WarehouseGridProps {
  warehouse_id?: string;
}

function WarehouseGrid({ warehouse_id }: WarehouseGridProps) {
  const { t } = useTranslation(['warehouse', 'common']);
  const { cells, loaders, setCells } = useWarehouseCellStore();
  const loading = loaders["cells/fetch-cells"];
  
  // Role change state
  const [selectedCell, setSelectedCell] = useState<WarehouseCell | null>(null);
  const [cellRoles, setCellRoles] = useState<Array<{ value: string; label: string }>>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    cellId: string;
    newRole: string;
    oldRole: string;
  }>({ show: false, cellId: '', newRole: '', oldRole: '' });

  // Check if user is ADMIN
  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "ADMIN";

  // Load cell roles on component mount
  useEffect(() => {
    if (isAdmin) {
      loadCellRoles();
    }
  }, [isAdmin]);

  const loadCellRoles = async () => {
    try {
      const roles = await WarehouseCellService.fetchCellRoles();
      setCellRoles(roles);
    } catch (error) {
      console.error("Error loading cell roles:", error);
      toast.error(t('warehouse:failed_to_load_cell_roles'));
    }
  };

  const handleCellClick = (cell: WarehouseCell) => {
    if (!isAdmin || cell.is_passage) return;
    
    setSelectedCell(cell);
    setShowRoleDropdown(true);
  };

  const handleRoleSelect = (newRole: string) => {
    if (!selectedCell) return;
    
    setConfirmDialog({
      show: true,
      cellId: selectedCell.id,
      newRole,
      oldRole: selectedCell.cell_role || 'STANDARD',
    });
    setShowRoleDropdown(false);
  };

  const confirmRoleChange = async () => {
    const { cellId, newRole, oldRole } = confirmDialog;
    
    try {
      const result = await WarehouseCellService.changeCellRole(cellId, newRole);
      
      if (result.success) {
        toast.success(result.message || t('warehouse:cell_role_changed_successfully'));
        
        // Update the cell in the store
        const updatedCells = cells.map(cell => 
          cell.id === cellId 
            ? { ...cell, cell_role: newRole }
            : cell
        );
        setCells(updatedCells);
      }
    } catch (error: any) {
      console.error("Error changing cell role:", error);
      toast.error(error.message || t('warehouse:failed_to_change_cell_role'));
    } finally {
      setConfirmDialog({ show: false, cellId: '', newRole: '', oldRole: '' });
      setSelectedCell(null);
    }
  };

  const cancelRoleChange = () => {
    setConfirmDialog({ show: false, cellId: '', newRole: '', oldRole: '' });
    setSelectedCell(null);
    setShowRoleDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  if (!warehouse_id) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('warehouse:select_warehouse_prompt')}</h3>
          <p className="text-sm text-gray-500">{t('warehouse:select_warehouse_to_view_grid')}</p>
        </div>
      </div>
    );
  }

  const filtered = cells.filter((c) => c.warehouse_id === warehouse_id);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('warehouse:no_cells_found')}</h3>
          <p className="text-sm text-gray-500">{t('warehouse:no_cells_for_warehouse')}</p>
        </div>
      </div>
    );
  }

  const rows = Array.from(new Set(filtered.map((c) => c.row))).sort((a, b) => {
    // Special rows order: regular rows (A-P) first, then Q, then special rows (R, T, V)
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

  const bays = Array.from(new Set(filtered.map((c) => c.bay))).sort(
    (a, b) => a - b
  );

  // Get actual positions per row instead of assuming 10 positions for all rows
  const getPositionsForRow = (row: string) => {
    const rowCells = filtered.filter(c => c.row === row);
    return Array.from(new Set(rowCells.map(c => c.position))).sort((a, b) => b - a);
  };


  const lookup: Record<
    string,
    Record<number, Record<number, WarehouseCell>>
  > = {};
  filtered.forEach((c) => {
    lookup[c.row] ||= {};
    lookup[c.row][c.bay] ||= {};
    lookup[c.row][c.bay][c.position] = c;
  });

  const getCellStyle = (cell?: WarehouseCell) => {
    if (!cell) return "bg-gray-100";
    
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

  const isDivider = (row: string, bay: number) =>
    row === "Q" && (bay === 20 || bay === 24);
  
  const formatId = (r: string, b: number, p: number) =>
    `${r}.${String(b).padStart(2, "0")}.${String(p).padStart(2, "0")}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Enhanced legend with statistics */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-emerald-400 border border-emerald-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-emerald-200 border border-emerald-300 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:standard')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-rose-300 border border-rose-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:damaged')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-amber-300 border border-amber-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:expired')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-red-300 border border-red-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:rejected')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-purple-300 border border-purple-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:samples')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                <div className="w-3 h-3 bg-blue-300 border border-blue-500 rounded-l-sm"></div>
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-r-sm"></div>
              </div>
              <span>{t('warehouse:returns')}</span>
            </div>
            <LegendItem color="bg-gray-200 border-gray-400" label={t('warehouse:passage')} />
          </div>
          <div className="text-xs text-gray-600 flex gap-4">
            <span><strong>{t('warehouse:total_cells')}:</strong> {filtered.filter(cell => !cell.is_passage).length}</span>
            <span><strong>{t('warehouse:rows')}:</strong> {rows.length}</span>
            <span><strong>{t('warehouse:bays')}:</strong> {bays.length}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        <div className="max-h-[70vh] overflow-auto">
          <table className="border-collapse text-xs w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 bg-white z-10 p-1 border font-bold text-xs w-8">{t('warehouse:row')}</th>
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
                              {t('warehouse:special_section')}
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
                          const style = getCellStyle(cell);
                          const divClass = isDivider(row, bay - 1)
                            ? "border-l-2 border-l-gray-500"
                            : "";
                          return (
                            <td
                              key={`${row}-${bay}-${pos}`}
                              className={clsx(
                                "h-6 sm:h-8 border text-[7px] sm:text-[9px] text-center relative",
                                "w-[1.8rem] sm:w-10 px-0.5",
                                style,
                                divClass,
                                isAdmin && cell && !cell.is_passage && "cursor-pointer hover:opacity-80"
                              )}
                              title={
                                cell
                                  ? `${formatId(row, bay, pos)} - ${
                                      cell.cell_role
                                    } - ${cell.status}${isAdmin ? ' (Click to change role)' : ''}`
                                  : `No cell at ${formatId(row, bay, pos)}`
                              }
                              onClick={() => cell && handleCellClick(cell)}
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

      {/* Role Change Dropdown */}
      {showRoleDropdown && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {t('warehouse:change_cell_role')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('warehouse:cell')}: {formatId(selectedCell.row, selectedCell.bay, selectedCell.position)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {t('warehouse:current_role')}: {selectedCell.cell_role || 'STANDARD'}
            </p>
            
            <div className="space-y-2 mb-6">
              {cellRoles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className="w-full text-left px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={role.value === selectedCell.cell_role}
                >
                  <span className={role.value === selectedCell.cell_role ? 'text-gray-400' : 'text-gray-900'}>
                    {role.label}
                    {role.value === selectedCell.cell_role && ' (Current)'}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelRoleChange}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              {t('warehouse:confirm_role_change')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('warehouse:change_role_confirmation', {
                oldRole: confirmDialog.oldRole,
                newRole: confirmDialog.newRole
              })}
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelRoleChange}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('warehouse:confirm_change')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className={clsx("w-4 h-4 rounded-sm", color)}></div>
      <span>{label}</span>
    </div>
  );
}

export default WarehouseGrid;
