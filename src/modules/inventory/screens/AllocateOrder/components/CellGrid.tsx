import React, { useMemo } from "react";

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
};

const STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: "bg-green-200 cursor-pointer",
  OCCUPIED: "bg-gray-300",
  DAMAGED: "bg-red-200",
  EXPIRED: "bg-yellow-200",
};

const formatCellReference = (
  row: string,
  bay: number,
  position: number
): string => `${row}${String(bay).padStart(2, "0")}.${String(position).padStart(2, "0")}`;

interface CellGridProps {
  cells: Cell[];
  onSelect: (cell: Cell) => void;
  selectedId?: string;
}

const CellGrid: React.FC<CellGridProps> = ({ cells = [], onSelect, selectedId }) => {
  const cellsArray = Array.isArray(cells) ? cells : [];

  const { map, rows, maxBay, maxPosition } = useMemo(() => {
    const map: Record<string, Record<number, Record<number, Cell>>> = {};
    let maxBay = 0;
    let maxPosition = 0;

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
    });

    return {
      map,
      rows: Object.keys(map).sort(),
      maxBay,
      maxPosition,
    };
  }, [cellsArray]);

  if (rows.length === 0) {
    return (
      <div className="p-4 border rounded bg-gray-50 text-gray-500">
        No valid cells available in this warehouse.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 bg-white">
        <LegendItem color="bg-green-200" label="Available" />
        <LegendItem color="bg-gray-300" label="Occupied" />
        <LegendItem color="bg-red-200" label="Damaged" />
        <LegendItem color="bg-yellow-200" label="Expired" />
      </div>

      {/* scrollable grid */}
      <div className="max-h-[200px] overflow-auto">
        <table className="table-fixed border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="w-16 p-1 border-b"></th>
              {Array.from({ length: maxBay }, (_, i) => {
                const bay = i + 1;
                return (
                  <th
                    key={bay}
                    className="w-16 p-1 border-b text-center text-sm font-medium"
                  >
                    {bay < 10 ? `0${bay}` : bay}
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
                  <tr key={`${rowLetter}-${position}`}>
                    {/* Row header: e.g. A.01 */}
                    <td className="sticky left-0 bg-white border-r p-1 font-medium text-xs">
                      {`${rowLetter}.${String(position).padStart(2, "0")}`}
                    </td>

                    {/* One cell per bay */}
                    {Array.from({ length: maxBay }, (_, bi) => {
                      const bay = bi + 1;
                      const cell = map[rowLetter]?.[bay]?.[position];
                      const statusClass = cell ? STATUS_CLASSES[cell.status] : "bg-white";
                      const isSelected = cell?.cell_id === selectedId;
                      return (
                        <td
                          key={`${rowLetter}-${bay}-${position}`}
                          className={
                            `h-8 w-16 border text-xs text-center p-1 ${statusClass} ${
                              isSelected ? "ring-2 ring-blue-500" : ""
                            }`
                          }
                          onClick={() => cell?.status === "AVAILABLE" && onSelect(cell)}
                        >
                          {cell?.cellReference ?? "--"}
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
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className="flex items-center space-x-2 text-sm">
    <span className={`inline-block w-4 h-4 ${color} border`}></span>
    <span>{label}</span>
  </div>
);

export default CellGrid;