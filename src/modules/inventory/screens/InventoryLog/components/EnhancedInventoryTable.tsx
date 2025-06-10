/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTranslation } from "react-i18next";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
// Using emoji icons instead of lucide-react

interface EnhancedInventoryTableProps<T extends object = any> {
  columns: ColumnDef<T, any>[];
  data: T[];
  topBar?: React.ReactNode;
  maxBodyHeight?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function EnhancedInventoryTable<T extends object = any>({
  columns,
  data,
  topBar,
  maxBodyHeight = "calc(100vh - 280px)",
  onRowClick,
  isLoading = false,
}: EnhancedInventoryTableProps<T>) {
  const { t } = useTranslation(['inventory', 'common']);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: { 
      pagination: { 
        pageIndex: 0, 
        pageSize: 25 // Increased from 10 to 25
      } 
    },
  });

  const pageSizeOptions = [10, 25, 50, 100];

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
      {topBar && (
        <div className="px-6 py-4 border-b border-gray-200">
          {topBar}
        </div>
      )}
      
      {/* Table Container */}
      <div className="relative">
        <div 
          className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
          style={{ maxHeight: maxBodyHeight }}
        >
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    
                    return (
                      <th
                        key={header.id}
                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 ${
                          canSort ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                        }`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center space-x-1">
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {canSort && (
                            <span className={`text-sm ${
                              sortDirection === 'asc' ? 'text-blue-600' : 
                              sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  {/* Action column */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-20">
                    {t('common:actions')}
                  </th>
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors cursor-pointer group`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                  {/* Action buttons */}
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(row.original);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('common:view_details')}
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle external link action
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title={t('common:open_external')}
                      >
                        Link
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Results info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {t('common:showing')}{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              {t('common:to')}{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length
                )}
              </span>{" "}
              {t('common:of')}{" "}
              <span className="font-medium">{data.length}</span>{" "}
              {t('common:results')}
            </div>
            
            {/* Page size selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">
                {t('common:rows_per_page')}:
              </label>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
              title={t('common:first_page')}
            >
              First
            </button>
            
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
              title={t('common:previous_page')}
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, table.getPageCount()))].map((_, i) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageCount = table.getPageCount();
                let displayPage: number;
                
                if (pageCount <= 5) {
                  displayPage = i;
                } else if (pageIndex < 3) {
                  displayPage = i;
                } else if (pageIndex > pageCount - 4) {
                  displayPage = pageCount - 5 + i;
                } else {
                  displayPage = pageIndex - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(displayPage)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      pageIndex === displayPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {displayPage + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
              title={t('common:next_page')}
            >
              Next
            </button>
            
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
              title={t('common:last_page')}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedInventoryTable; 