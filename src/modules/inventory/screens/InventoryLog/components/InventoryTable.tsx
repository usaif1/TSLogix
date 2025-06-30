/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/table/InventoryTable.tsx
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

interface InventoryTableProps<T extends object = any> {
  columns: ColumnDef<T, any>[];
  data: T[];
  /**
   * Optional search input and action bar above the table.
   */
  topBar?: React.ReactNode;
  /**
   * Max height for the table body scroll area.
   */
  maxBodyHeight?: string;
}

export function InventoryTable<T extends object = any>({
  columns,
  data,
  topBar,
  maxBodyHeight = "80vh",
}: InventoryTableProps<T>) {
  const { t } = useTranslation(['inventory', 'common']);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  return (
    <div className="w-full max-w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {topBar && <div className="px-6 py-4 border-b border-gray-200">{topBar}</div>}
      
      {/* Table wrapper with horizontal scroll and max width */}
      <div className="w-full overflow-x-auto">
        <div style={{ maxHeight: maxBodyHeight, overflowY: "auto" }}>
          <table className="w-full table-fixed divide-y divide-gray-200" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const size = (header.column.columnDef as any).size;
                    return (
                      <th
                        key={header.id}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        style={{ width: size ? `${size}px` : 'auto' }}
                      >
                        <div className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, idx) => {
                  const isDeparture = (row.original as any).movement_type === "DEPARTURE";
                  const baseRowClass = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                  const departureClass = isDeparture ? "bg-red-50 border-l-4 border-l-red-500" : "";
                  const hoverClass = isDeparture ? "hover:bg-red-100" : "hover:bg-gray-100";
                  
                  return (
                    <tr
                      key={row.id}
                      className={`${baseRowClass} ${departureClass} ${hoverClass} transition-colors`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-3 text-sm text-gray-600 border-r border-gray-100 last:border-r-0 overflow-hidden"
                        >
                          <div className="w-full overflow-hidden">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-400 rounded"></div>
                      </div>
                      <div className="text-lg font-medium mb-2">
                        {t('inventory:no_data_found')}
                      </div>
                      <div className="text-sm text-center max-w-md">
                        {t('inventory:no_inventory_entries_match_criteria')}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Pagination - Same as other tables in the codebase */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {t('inventory:showing')}{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length
              )}
            </span>{" "}
            {t('common:of')} <span className="font-medium">{data.length}</span> {t('inventory:results')}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t('common:previous')}
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t('common:next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;
