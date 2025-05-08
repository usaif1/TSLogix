import React from "react";
import clsx from "clsx";
import useWarehouseCellStore, { WarehouseCell } from "@/modules/warehouse/store";

interface WarehouseGridProps {
  warehouse_id?: string;
}
function WarehouseGrid({ warehouse_id }: WarehouseGridProps) {
  const { cells, loaders } = useWarehouseCellStore();
  const loading = loaders["cells/fetch-cells"];
  if (loading) return <div>Loading...</div>;

  const filtered = warehouse_id
    ? cells.filter((c) => c.warehouse_id === warehouse_id)
    : cells;

  const dynamicRows = Array.from(new Set(filtered.map((c) => c.row))).sort();
  const dynamicBays = Array.from(new Set(filtered.map((c) => c.bay))).sort((a, b) => a - b);
  const dynamicPositions = Array.from({ length: 10 }, (_, i) => i + 1);

  const lookup: Record<string, Record<number, Record<number, WarehouseCell>>> = {};
  filtered.forEach((c) => {
    lookup[c.row] ||= {};
    lookup[c.row][c.bay] ||= {};
    lookup[c.row][c.bay][c.position] = c;
  });

  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: "bg-green-500",
    OCCUPIED: "bg-red-600",
    PARTIALLY_OCCUPIED: "bg-yellow-500",
  };

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10"></th>
            {dynamicBays.map((bay) => (
              <th key={bay} className="p-1 sticky top-0 bg-white border">
                {String(bay).padStart(2, "0")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dynamicRows.map((row) => (
            <React.Fragment key={row}>
              {dynamicPositions.map((pos) => (
                <tr key={`${row}-${pos}`}>                  
                  <td
                    className={clsx(
                      "sticky left-0 bg-white border-r px-2 font-bold",
                      pos !== dynamicPositions.length && "hidden"
                    )}
                  >
                    {pos === dynamicPositions.length && row}
                  </td>
                  {dynamicBays.map((bay) => {
                    const cell = lookup[row]?.[bay]?.[pos];
                    const bg = cell
                      ? STATUS_COLORS[cell.status] || "bg-gray-200"
                      : "bg-gray-100";
                    const label = cell
                      ? `${row}.${String(bay).padStart(2, "0")}.${String(pos).padStart(2, "0")}`
                      : "";

                    return (
                      <td
                        key={`${row}-${bay}-${pos}`}
                        className={clsx(
                          "w-12 h-6 border text-[8px] text-center",
                          bg
                        )}
                      >
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WarehouseGrid;