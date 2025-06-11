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

const SELECTED_CLASS = "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300";

const formatCellReference = (
  row: string,
  bay: number,
  position: number
): string => `${row}.${String(bay).padStart(2, "0")}.${String(position).padStart(2, "0")}`;

interface CellGridProps {
  cells: Cell[];
  onSelect: (cell: Cell) => void;
  selectedId?: string;
  showSpecialRows?: boolean;
  specialRowsOnly?: boolean;
  allowedRows?: string[];
}

const CellGrid: React.FC<CellGridProps> = ({ 
  cells = [], 
  onSelect, 
  selectedId, 
  showSpecialRows = false,
  specialRowsOnly = false,
  allowedRows
}) => {
  const { t } = useTranslation(['inventory', 'warehouse']);
  const cellsArray = Array.isArray(cells) ? cells : [];

  const { map, rows, maxBay, maxPosition } = useMemo(() => {
    const map: Record<string, Record<number, Record<number, Cell>>> = {};
    let maxBay = 0;
    let maxPosition = 0;

    const filteredCells = cellsArray.filter((c) => {
      if (!c.row) return false;
      
      if (allowedRows && allowedRows.length > 0) {
        return allowedRows.includes(c.row);
      }
      
      if (specialRowsOnly) {
        return ['V', 'T', 'R'].includes(c.row);
      }
      
      if (showSpecialRows) {
        return true;
      }
      
      return c.row <= 'Q' && !['V', 'T', 'R'].includes(c.row);
    });

    filteredCells.forEach((c) => {
      if (!c.row || c.bay == null || c.position == null) return;
      map[c.row] = map[c.row] || {};
      map[c.row][c.bay] = map[c.row][c.bay] || {};
      map[c.row][c.bay][c.position] = {
        ...c,
        cellReference: c.cellReference || formatCellReference(c.row, c.bay, c.position),
      };
      maxBay = Math.max(maxBay, c.bay);
      maxPosition = Math.max(maxPosition, c.position);
    });

    const allRows = Object.keys(map);
    const sortedRows = allRows.sort((a, b) => {
      const specialRows = ['V', 'T', 'R'];
      const aIsSpecial = specialRows.includes(a);
      const bIsSpecial = specialRows.includes(b);
      
      if (aIsSpecial && !bIsSpecial) return 1;
      if (!aIsSpecial && bIsSpecial) return -1;
      if (aIsSpecial && bIsSpecial) {
        return specialRows.indexOf(a) - specialRows.indexOf(b);
      }
      
      return a.localeCompare(b);
    });
    
    console.log('CellGrid filtered rows:', sortedRows, {
      showSpecialRows,
      specialRowsOnly,
      allowedRows,
      originalCellsCount: cellsArray.length,
      filteredCellsCount: filteredCells.length
    });

    return {
      map,
      rows: sortedRows,
      maxBay,
      maxPosition,
    };
  }, [cellsArray, showSpecialRows, specialRowsOnly, allowedRows]);

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
            <p className="text-xs text-gray-400">
              {specialRowsOnly || allowedRows 
                ? t('inventory:no_special_cells_available')
                : t('inventory:select_warehouse_first')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableCellsCount = cellsArray.filter(c => {
    const passesRowFilter = (() => {
      if (!c.row) return false;
      if (allowedRows && allowedRows.length > 0) return allowedRows.includes(c.row);
      if (specialRowsOnly) return ['V', 'T', 'R'].includes(c.row);
      if (showSpecialRows) return true;
      return c.row <= 'Q' && !['V', 'T', 'R'].includes(c.row);
    })();
    return passesRowFilter && c.status === 'AVAILABLE';
  }).length;

  const getGridTitle = () => {
    if (specialRowsOnly) return t('inventory:special_purpose_cells');
    if (allowedRows && allowedRows.length > 0) return t('inventory:designated_cells');
    if (showSpecialRows) return t('inventory:all_available_cells');
    return t('inventory:cell_selection');
  };

  const getGridDescription = () => {
    if (specialRowsOnly) return t('inventory:special_rows_only');
    if (allowedRows && allowedRows.length > 0) return `(${allowedRows.join(', ')} ${t('inventory:rows')})`;
    if (showSpecialRows) return t('inventory:all_rows_available');
    return `(${t('inventory:rows_a_through_q')})`;
  };

  const getLegendItems = () => {
    const legends = [
      { 
        color: "bg-emerald-100 border-emerald-300", 
        label: t('warehouse:available') 
      },
      { 
        color: "bg-gray-200 border-gray-400", 
        label: t('warehouse:occupied') 
      }
    ];

    // Add specific cell type legends based on what's being shown
    if (allowedRows && allowedRows.length > 0) {
      allowedRows.forEach(row => {
        if (row === 'V') {
          legends.push({
            color: "bg-blue-100 border-blue-300",
            label: t('inventory:devoluciones')
          });
        } else if (row === 'T') {
          legends.push({
            color: "bg-purple-100 border-purple-300", 
            label: t('inventory:contramuestras')
          });
        } else if (row === 'R') {
          legends.push({
            color: "bg-red-100 border-red-300",
            label: t('inventory:rechazados')
          });
        }
      });
    } else if (specialRowsOnly) {
      // Show all special row types when specialRowsOnly is true
      legends.push(
        {
          color: "bg-blue-100 border-blue-300",
          label: t('inventory:devoluciones')
        },
        {
          color: "bg-purple-100 border-purple-300",
          label: t('inventory:contramuestras')
        },
        {
          color: "bg-red-100 border-red-300", 
          label: t('inventory:rechazados')
        }
      );
    }
    return legends;
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="bg-gray-50 px-3 sm:px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {getGridTitle()}
          </h3>
          <div className="text-xs text-gray-600 space-x-4">
            <span>{availableCellsCount} {t('inventory:available_cells')}</span>
            <span className="text-gray-500">
              {getGridDescription()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {getLegendItems().map((legend, index) => (
            <LegendItem 
              key={index}
              color={legend.color} 
              label={legend.label} 
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="h-80 overflow-auto border-b border-gray-200">
          <table className="border-collapse table-fixed" style={{ width: 'auto' }}>
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 p-1 text-left w-12">
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
                  
                  return (
                    <tr key={`${rowLetter}-${position}`} className={clsx(
                      "hover:bg-gray-50"
                    )}>
                      <td className={clsx(
                        "sticky left-0 z-10 bg-white border-r border-gray-200 p-1 w-12"
                      )}>
                        <span className={clsx(
                          "text-[10px] font-semibold whitespace-nowrap text-gray-700"
                        )}>
                          {`${rowLetter}.${String(position).padStart(2, "0")}`}
                        </span>
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
                            title={`${cell.cellReference} - ${cell.status} - ${t('inventory:capacity')}: ${cell.capacity}`}
                          >
                            <div className="flex flex-col items-center justify-center h-full p-0.5">
                              <span className={clsx(
                                "text-[7px] font-medium text-center leading-none",
                                isSelected ? "text-white" : "text-gray-800"
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
                                    cell.status === "AVAILABLE" ? "text-green-600" : 
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