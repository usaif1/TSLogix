/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/table/InventoryTable.tsx
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

interface InventoryTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  renderActions?: (item: T) => React.ReactNode;
  /**
   * Max height for the table body scroll area.
   */
  maxBodyHeight?: string;
}

/**
 * Paginated table with improved UI, sticky headers, and custom styling.
 */
export function InventoryTable<T extends object>({
  columns,
  data,
  renderActions,
  maxBodyHeight = "70vh",
}: InventoryTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  return (
    <div className="bg-white shadow-md rounded-lg flex flex-col">
      {/* Scrollable table body */}
      <div className="overflow-auto" style={{ maxHeight: maxBodyHeight }}>
        <table className="min-w-full">
          <thead className="bg-gray-100 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 text-left text-sm font-medium text-gray-700 border-b"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
                {renderActions && (
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 border-b">
                    Actions
                  </th>
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 last:border-none"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 text-sm text-gray-600 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">
                    {renderActions(row.original)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-white">
        <div className="text-sm text-gray-600">
          Page{" "}
          <span className="font-semibold">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of <span className="font-semibold">{table.getPageCount()}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm text-black shadow rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm text-black shadow rounded-md  disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Show{" "}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="ml-1 px-2 py-1 border border-gray-300 rounded-md"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default InventoryTable;