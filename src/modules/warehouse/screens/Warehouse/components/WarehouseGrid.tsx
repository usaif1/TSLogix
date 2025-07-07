import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import useWarehouseCellStore, {
  WarehouseCell,
} from "@/modules/warehouse/store";

interface WarehouseGridProps {
  warehouse_id?: string;
}

function WarehouseGrid({ warehouse_id }: WarehouseGridProps) {
  const { t } = useTranslation(['warehouse', 'common']);
  const { cells, loaders } = useWarehouseCellStore();
  const loading = loaders["cells/fetch-cells"];

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
    return Array.from(new Set(rowCells.map(c => c.position))).sort((a, b) => a - b);
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
    
    // Occupied cells are always gray regardless of row
    if (cell.status === "OCCUPIED") return "bg-gray-200 text-black";
    
    if (cell.status === "AVAILABLE") {
      // Special rows have their own color schemes for available cells
      if (cell.row === "R") {
        // R row (Rejected): Red-based colors
        return "bg-red-300 border-red-500 text-red-900";
      }
      if (cell.row === "T") {
        // T row (Samples/Contramuestras): Purple-based colors
        return "bg-purple-300 border-purple-500 text-purple-900";
      }
      if (cell.row === "V") {
        // V row (Returns/Devoluciones): Blue-based colors
        return "bg-blue-300 border-blue-500 text-blue-900";
      }
      
      // Regular rows and Q row use the original color scheme
      switch (cell.cell_role) {
        case "DAMAGED":
          return "bg-rose-200 border-rose-400";
        case "EXPIRED":
          return "bg-amber-200 border-amber-400";
        default:
          return "bg-emerald-400";
      }
    }
    return "bg-gray-600";
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
            <LegendItem color="bg-emerald-400" label={t('warehouse:available')} />
            <LegendItem color="bg-gray-200" label={t('warehouse:occupied')} />
            <LegendItem color="bg-red-300 border-red-500" label={`${t('warehouse:row')} R - ${t('warehouse:rechazados')}`} />
            <LegendItem color="bg-purple-300 border-purple-500" label={`${t('warehouse:row')} T - ${t('warehouse:contramuestras')}`} />
            <LegendItem color="bg-blue-300 border-blue-500" label={`${t('warehouse:row')} V - ${t('warehouse:devoluciones')}`} />
          </div>
          <div className="text-xs text-gray-600 flex gap-4">
            <span><strong>{t('warehouse:total_cells')}:</strong> {filtered.length}</span>
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
                                divClass
                              )}
                              title={
                                cell
                                  ? `${formatId(row, bay, pos)} - ${
                                      cell.cell_role
                                    } - ${cell.status}`
                                  : `No cell at ${formatId(row, bay, pos)}`
                              }
                            >
                              {cell ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <span className="font-mono">{formatId(row, bay, pos)}</span>
                                  {hasMultiplePositions && (
                                    <span className="text-[6px] sm:text-[8px] text-gray-600">P{pos}</span>
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
