import { useTranslation } from "react-i18next";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

// Extend the ColumnMeta interface to include our custom properties
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    isFixed?: boolean;
  }
}

// Server-side pagination info interface
interface ServerPaginationInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  showPagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  // Server-side pagination props
  serverPagination?: ServerPaginationInfo;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

function DataTable<T extends object>({
  data,
  columns,
  showPagination = false,
  pageSize = 10,
  emptyMessage,
  className = "",
  onRowClick,
  serverPagination,
  onPageChange,
  isLoading = false,
}: DataTableProps<T>) {
  const { t } = useTranslation('components');

  const defaultEmptyMessage = t('no_data');
  const actualEmptyMessage = emptyMessage || defaultEmptyMessage;

  // Use server-side pagination if provided
  const isServerSidePagination = !!serverPagination && !!onPageChange;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only use client-side pagination if NOT using server-side
    getPaginationRowModel: showPagination && !isServerSidePagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    // For server-side pagination, we need manual pagination
    manualPagination: isServerSidePagination,
    pageCount: isServerSidePagination ? serverPagination.totalPages : undefined,
  });

  return (
    <div className={`rounded-md shadow-sm border border-gray-200 ${className}`}>
      {/* Table Container for horizontal scroll */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
          overflow: "auto",
          whiteSpace: "normal",
        }}
      >
        <table className="w-full table-auto overflow-y-scroll" style={{}}>

          {/* Table Header */}
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header, index) => {
                  const isFixed = header.column.columnDef.meta?.isFixed;
                  let stickyClass = "";
                  
                  if (isFixed && index === 0) {
                    stickyClass = "sticky left-0 bg-gray-50 shadow-md z-10 min-w-[200px]";
                  } else if (isFixed && index === 1) {
                    stickyClass = "sticky left-[200px] bg-gray-50 shadow-md z-10 min-w-[200px]";
                  } else if (index === 0) {
                    // Fallback: make first column sticky even without meta.isFixed
                    stickyClass = "sticky left-0 bg-gray-50 shadow-md z-10 min-w-[200px]";
                  }
                  
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${stickyClass}`}
                    >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-200 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isFixed = cell.column.columnDef.meta?.isFixed;
                    let stickyClass = "";
                    
                    if (isFixed && index === 0) {
                      stickyClass = "sticky left-0 bg-white shadow-md z-10 min-w-[200px]";
                    } else if (isFixed && index === 1) {
                      stickyClass = "sticky left-[200px] bg-white shadow-md z-10 min-w-[200px]";
                    } else if (index === 0) {
                      // Fallback: make first column sticky even without meta.isFixed
                      stickyClass = "sticky left-0 bg-white shadow-md z-10 min-w-[200px]";
                    }
                    
                    return (
                      <td
                        key={cell.id}
                        className={`px-6 py-4 text-sm text-gray-700 truncate max-w-xs ${stickyClass}`}
                        title={String(cell.getValue() || "")}
                      >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-500"
                >
                  {actualEmptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && data.length > 0 && (
        <div className="flex items-center sticky bottom-0 justify-between px-4 py-3 bg-white border-t border-gray-200 w-full">
          <div className="text-sm text-gray-700">
            {isLoading ? (
              <span className="text-gray-400">{t('loading', 'Loading...')}</span>
            ) : isServerSidePagination ? (
              // Server-side pagination info
              <>
                {t('showing')}{" "}
                <span className="font-medium">
                  {((serverPagination.currentPage - 1) * pageSize) + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(serverPagination.currentPage * pageSize, serverPagination.totalItems)}
                </span>{" "}
                {t('of')} <span className="font-medium">{serverPagination.totalItems}</span> {t('results')}
              </>
            ) : (
              // Client-side pagination info
              <>
                {t('showing')}{" "}
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
                {t('of')} <span className="font-medium">{data.length}</span> {t('results')}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isServerSidePagination ? (
              // Server-side pagination buttons
              <>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onPageChange(serverPagination.currentPage - 1)}
                  disabled={!serverPagination.hasPreviousPage || isLoading}
                >
                  {t('previous')}
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  {t('page', 'Page')} {serverPagination.currentPage} {t('of')} {serverPagination.totalPages}
                </span>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onPageChange(serverPagination.currentPage + 1)}
                  disabled={!serverPagination.hasNextPage || isLoading}
                >
                  {t('next')}
                </button>
              </>
            ) : (
              // Client-side pagination buttons
              <>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t('previous')}
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t('next')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
