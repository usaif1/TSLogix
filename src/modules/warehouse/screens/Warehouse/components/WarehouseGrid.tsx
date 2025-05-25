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
    if (a === "Q") return 1;
    if (b === "Q") return -1;
    return a.localeCompare(b);
  });

  const bays = Array.from(new Set(filtered.map((c) => c.bay))).sort(
    (a, b) => a - b
  );
  const positions = Array.from({ length: 10 }, (_, i) => i + 1);

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
    if (cell.status === "OCCUPIED") return "bg-gray-200 text-black";
    if (cell.status === "AVAILABLE") {
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
      {/* Simple legend */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <LegendItem color="bg-emerald-400" label={t('warehouse:available')} />
          <LegendItem color="bg-gray-200" label={t('warehouse:occupied')} />
          <LegendItem color="bg-rose-200 border-rose-400" label={t('warehouse:damaged_section')} />
          <LegendItem color="bg-amber-200 border-amber-400" label={t('warehouse:expired_section')} />
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        <div className="max-h-[70vh] overflow-auto">
          <table className="border-collapse text-xs w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 bg-white z-10 p-2 border"></th>
                {bays.map((bay) => (
                  <th
                    key={bay}
                    className={clsx(
                      "p-2 sticky top-0 bg-white border text-center",
                      "min-w-[2.5rem] sm:min-w-[3rem]"
                    )}
                  >
                    {String(bay).padStart(2, "0")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <React.Fragment key={row}>
                  {row === "Q" ? (
                    <tr className="h-6">
                      <td colSpan={bays.length + 1} className="border-0"></td>
                    </tr>
                  ) : null}
                  {positions.map((pos) => (
                    <tr key={`${row}-${pos}`}>
                      <td
                        className={clsx(
                          "sticky left-0 bg-white border-r px-2 sm:px-3 py-1 sm:py-2 font-bold",
                          pos === 5 ? "visible" : "invisible"
                        )}
                      >
                        {pos === 5 ? row : null}
                      </td>
                      {bays.map((bay) => {
                        const cell = lookup[row]?.[bay]?.[pos];
                        const style = getCellStyle(cell);
                        const divClass = isDivider(row, bay - 1)
                          ? "border-l-2 border-l-gray-500"
                          : "";
                        const showLabel =
                          row === "Q" && (bay === 21 || bay === 25) && pos === 1;
                        const labelText = bay === 21 ? "DAMAGED" : "EXPIRED";

                        return (
                          <td
                            key={`${row}-${bay}-${pos}`}
                            className={clsx(
                              "h-6 sm:h-8 border text-[7px] sm:text-[9px] text-center relative",
                              "w-[1.5rem] sm:w-12",
                              style,
                              divClass
                            )}
                            title={
                              cell
                                ? `${formatId(row, bay, pos)} - ${
                                    cell.cell_role
                                  } - ${cell.status}`
                                : undefined
                            }
                          >
                            {showLabel ? (
                              <span className="absolute -top-8 left-0 text-[8px] sm:text-[10px] font-bold whitespace-nowrap">
                                {labelText === "DAMAGED" ? 
                                  t('warehouse:damaged_section') : 
                                  t('warehouse:expired_section')}
                              </span>
                            ) : null}
                            {cell ? formatId(row, bay, pos) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {row === "Q" ? (
                    <tr className="h-6">
                      <td colSpan={bays.length + 1} className="border-0"></td>
                    </tr>
                  ) : null}
                  {ri < rows.length - 1 ? (
                    <tr className="h-2 sm:h-3">
                      <td className="bg-gray-100" colSpan={bays.length + 1}></td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
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
      <div className={clsx("w-4 h-4", color)}></div>
      <span>{label}</span>
    </div>
  );
}

export default WarehouseGrid;
