import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

export type Cell = {
  cell_id: string;
  warehouse_id: string;
  row: string;
  bay: number;
  position: number;
  cellReference?: string;
  capacity: number;
  currentUsage: number;
  status: "AVAILABLE" | "OCCUPIED" | "DAMAGED" | "EXPIRED";
  cell_role?: string;
  cellKind?: string;
};

const STATUS_CLASSES: Record<string, { bg: string; hover: string; border: string }> = {
  AVAILABLE: { 
    bg: "bg-emerald-100", 
    hover: "hover:bg-emerald-200", 
    border: "border-emerald-300" 
  },
  OCCUPIED: { 
    bg: "bg-gray-200", 
    hover: "", 
    border: "border-gray-400" 
  },
  DAMAGED: { 
    bg: "bg-red-100", 
    hover: "", 
    border: "border-red-300" 
  },
  EXPIRED: { 
    bg: "bg-yellow-100", 
    hover: "", 
    border: "border-yellow-300" 
  },
};

const SPECIAL_AREA_CLASSES: Record<string, { bg: string; border: string; label: string }> = {
  V: { 
    bg: "bg-blue-50", 
    border: "border-blue-300", 
    label: "Returns Area" 
  },
  T: { 
    bg: "bg-purple-50", 
    border: "border-purple-300", 
    label: "Samples Area" 
  },
  R: { 
    bg: "bg-red-50", 
    border: "border-red-300", 
    label: "Rejected Area" 
  },
};

const SELECTED_CLASS = "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300";

const formatCellReference = (
  row: string,
  bay: number,
  position: number
): string => `${row}.${String(bay).padStart(2, "0")}.${String(position).padStart(2, "0")}`;

const isSpecialArea = (row: string): boolean => {
  return ['V', 'T', 'R'].includes(row);
};

const getSpecialAreaInfo = (row: string) => {
  return SPECIAL_AREA_CLASSES[row] || null;
};

interface CellGridProps {
  cells: Cell[];
  onSelect: (cell: Cell) => void;
  selectedId?: string;
}

const CellGrid: React.FC<CellGridProps> = ({ cells = [], onSelect, selectedId }) => {
  const { t } = useTranslation(['inventory', 'warehouse']);
  const cellsArray = Array.isArray(cells) ? cells : [];

  const { map, rows, maxBay, maxPosition, specialAreas } = useMemo(() => {
    const map: Record<string, Record<number, Record<number, Cell>>> = {};
    let maxBay = 0;
    let maxPosition = 0;
    const specialAreas: string[] = [];

    cellsArray.forEach((c) => {
      if (!c.row || c.bay == null || c.position == null) return;
      map[c.row] = map[c.row] || {};
      map[c.row][c.bay] = map[c.row][c.bay] || {};
      map[c.row][c.bay][c.position] = {
        ...c,
        cellReference: c.cellReference || formatCellReference(c.row, c.bay, c.position),
      };
      maxBay = Math.max(maxBay, c.bay);
      maxPosition = Math.max(maxPosition, c.position);
      
      if (isSpecialArea(c.row)) {
        if (!specialAreas.includes(c.row)) {
          specialAreas.push(c.row);
        }
      }
    });

    // Custom sorting to keep special areas (V, T, R) right after Q
    const allRows = Object.keys(map);
    
    // Debug: log the available rows
    console.log('All available rows:', allRows.sort());
    
    // More explicit sorting to ensure V, T, R appear right after Q
    const sortedRows: string[] = [];
    
    // First, add all rows before Q (A-P, excluding any V,T,R that might be there)
    allRows.forEach(row => {
      if (row < 'Q' && !['V', 'T', 'R'].includes(row)) {
        sortedRows.push(row);
      }
    });
    sortedRows.sort(); // Sort the pre-Q rows alphabetically
    
    // Add Q if it exists
    if (allRows.includes('Q')) {
      sortedRows.push('Q');
    }
    
    // Add special areas in exact order: V, T, R
    if (allRows.includes('V')) {
      sortedRows.push('V');
    }
    if (allRows.includes('T')) {
      sortedRows.push('T');
    }
    if (allRows.includes('R')) {
      sortedRows.push('R');
    }
    
    // Add all remaining rows after Q (S, U, W, X, Y, Z, etc.)
    const remainingRows: string[] = [];
    allRows.forEach(row => {
      if (row > 'Q' && !['V', 'T', 'R'].includes(row)) {
        remainingRows.push(row);
      }
    });
    remainingRows.sort(); // Sort alphabetically
    sortedRows.push(...remainingRows);
    
    // Debug: log the final order
    console.log('Final sorted order:', sortedRows);

    return {
      map,
      rows: sortedRows,
      maxBay,
      maxPosition,
      specialAreas: specialAreas.sort(),
    };
  }, [cellsArray]);

  if (rows.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{t('inventory:no_cells_available')}</p>
            <p className="text-xs text-gray-400">{t('inventory:select_warehouse_first')}</p>
          </div>
        </div>
      </div>
    );
  }

  const availableCellsCount = cellsArray.filter(c => c.status === 'AVAILABLE').length;
  const specialAreaCellsCount = cellsArray.filter(c => isSpecialArea(c.row)).length;

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="bg-gray-50 px-3 sm:px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {t('inventory:cell_selection')}
          </h3>
          <div className="text-xs text-gray-600 space-x-4">
            <span>{availableCellsCount} {t('inventory:available_cells')}</span>
            {specialAreaCellsCount > 0 && (
              <span className="text-purple-600">
                {specialAreaCellsCount} {t('inventory:special_area_cells')}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <LegendItem 
            color="bg-emerald-100 border-emerald-300" 
            label={t('warehouse:available')} 
          />
          <LegendItem 
            color="bg-gray-200 border-gray-400" 
            label={t('warehouse:occupied')} 
          />
          <LegendItem 
            color="bg-red-100 border-red-300" 
            label={t('warehouse:damaged_section')} 
          />
          <LegendItem 
            color="bg-yellow-100 border-yellow-300" 
            label={t('warehouse:expired_section')} 
          />
          {specialAreas.includes('V') && (
            <LegendItem 
              color="bg-blue-50 border-blue-300" 
              label={t('inventory:returns_area')} 
            />
          )}
          {specialAreas.includes('T') && (
            <LegendItem 
              color="bg-purple-50 border-purple-300" 
              label={t('inventory:samples_area')} 
            />
          )}
          {specialAreas.includes('R') && (
            <LegendItem 
              color="bg-red-50 border-red-300" 
              label={t('inventory:rejected_area')} 
            />
          )}
        </div>
      </div>

      {specialAreas.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-yellow-800 font-medium">
              {t('inventory:special_areas_notice')}: {specialAreas.join(', ')} {t('inventory:areas_for_quality_control')}
            </span>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="h-80 overflow-auto border-b border-gray-200">
          <table className="border-collapse table-fixed" style={{ width: 'auto' }}>
            <thead className="sticky top-0 bg-white z-20 shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 p-1 text-left w-12">
                  <span className="text-[10px] font-medium text-gray-600">
                    {t('inventory:position')}
                  </span>
                </th>
                {Array.from({ length: maxBay }, (_, i) => {
                  const bay = i + 1;
                  return (
                    <th
                      key={bay}
                      className="border-b border-gray-200 text-center bg-gray-50 p-1 w-6"
                      style={{ width: '24px', minWidth: '24px', maxWidth: '24px' }}
                    >
                      <span className="text-[9px] font-medium text-gray-600 block">
                        <span className="font-bold">{String(bay).padStart(2, "0")}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowLetter) =>
                Array.from({ length: maxPosition }, (_, pi) => {
                  const position = pi + 1;
                  const isSpecialRow = isSpecialArea(rowLetter);
                  const specialAreaInfo = getSpecialAreaInfo(rowLetter);
                  
                  return (
                    <tr key={`${rowLetter}-${position}`} className={clsx(
                      "hover:bg-gray-50"
                    )}>
                      <td className={clsx(
                        "sticky left-0 z-10 bg-white border-r border-gray-200 p-1 w-12"
                      )}>
                        <span className={clsx(
                          "text-[10px] font-semibold whitespace-nowrap",
                          isSpecialRow ? "text-purple-700" : "text-gray-700"
                        )}>
                          {`${rowLetter}.${String(position).padStart(2, "0")}`}
                        </span>
                        {isSpecialRow && position === 1 && (
                          <div className="text-[7px] text-purple-600 font-bold">
                            {specialAreaInfo?.label.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {Array.from({ length: maxBay }, (_, bi) => {
                        const bay = bi + 1;
                        const cell = map[rowLetter]?.[bay]?.[position];
                        const isSelected = cell?.cell_id === selectedId;
                        const isAvailable = cell?.status === "AVAILABLE";
                        
                        if (!cell) {
                          return (
                            <td
                              key={`${rowLetter}-${bay}-${position}`}
                              className={clsx(
                                "h-8 w-6 border border-gray-100 bg-gray-50"
                              )}
                              style={{ width: '24px', minWidth: '24px', maxWidth: '24px' }}
                            >
                              <div className="flex items-center justify-center h-full">
                                <span className="text-[8px] text-gray-300">--</span>
                              </div>
                            </td>
                          );
                        }

                        const statusConfig = STATUS_CLASSES[cell.status];
                        
                        return (
                          <td
                            key={`${rowLetter}-${bay}-${position}`}
                            className={clsx(
                              "h-8 w-6 border border-gray-200 transition-all duration-150",
                              isSelected ? SELECTED_CLASS : [
                                statusConfig.bg,
                                statusConfig.border,
                                isAvailable && statusConfig.hover,
                                isAvailable && "cursor-pointer"
                              ]
                            )}
                            style={{ width: '50px', minWidth: '24px', maxWidth: '50px' }}
                            onClick={() => isAvailable && onSelect(cell)}
                            title={`${cell.cellReference} - ${cell.status} - ${t('inventory:capacity')}: ${cell.capacity}${isSpecialRow ? ` (${specialAreaInfo?.label})` : ''}`}
                          >
                            <div className="flex flex-col items-center justify-center h-full p-0.5">
                              <span className={clsx(
                                "text-[7px] font-medium text-center leading-none",
                                isSelected ? "text-white" : 
                                isSpecialRow ? "text-purple-800" : "text-gray-800"
                              )}>
                                {`${rowLetter}.${String(bay).padStart(2, "0")}.${String(position).padStart(2, "0")}`}
                              </span>
                              
                              <div className="flex items-center mt-0.5">
                                {isSelected && (
                                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {!isSelected && (
                                  <span className={clsx(
                                    "text-[8px]",
                                    cell.status === "AVAILABLE" ? 
                                      (isSpecialRow ? "text-purple-600" : "text-green-600") : 
                                    cell.status === "OCCUPIED" ? "text-gray-600" :
                                    cell.status === "DAMAGED" ? "text-red-600" : 
                                    "text-yellow-600"
                                  )}>
                                    {cell.status === "AVAILABLE" ? "✓" : 
                                     cell.status === "OCCUPIED" ? "●" :
                                     cell.status === "DAMAGED" ? "✕" : "⚠"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ 
  color: string; 
  label: string; 
  textColor?: string;
}> = ({ color, label, textColor = "text-gray-800" }) => (
  <div className="flex items-center space-x-1 sm:space-x-2">
    <span className={`inline-block w-3 h-3 sm:w-4 sm:h-4 ${color} rounded border flex-shrink-0`}></span>
    <span className={`text-xs font-medium ${textColor} truncate`}>{label}</span>
  </div>
);

export default CellGrid;