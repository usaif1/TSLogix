import React from "react";
import clsx from "clsx";
import useWarehouseCellStore, {
  WarehouseCell,
} from "@/modules/warehouse/store";

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
    `${r}${String(b).padStart(2, "0")}.${String(p).padStart(2, "0")}`;

  return (
    <div className="p-2">
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <LegendItem color="bg-white border-gray-300" label="Available" />
        <LegendItem color="bg-blue-500" label="Occupied" />
        <LegendItem
          color="bg-rose-200 border-rose-400"
          label="Damaged Section"
        />
        <LegendItem
          color="bg-amber-200 border-amber-400"
          label="Expired Section"
        />
      </div>

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
                            {labelText} SECTION
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
