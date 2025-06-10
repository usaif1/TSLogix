import { useTranslation } from "react-i18next";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  showPagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T extends object>({
  data,
  columns,
  showPagination = false,
  pageSize = 10,
  emptyMessage,
  className = "",
}: DataTableProps<T>) {
  const { t } = useTranslation('components');
  
  const defaultEmptyMessage = t('no_data');
  const actualEmptyMessage = emptyMessage || defaultEmptyMessage;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
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
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${
                      index === 0 ? "sticky left-0 bg-gray-50 shadow-md" : ""
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
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
                  } hover:bg-gray-100 transition-colors`}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`px-6 py-4 text-sm text-gray-700 truncate max-w-xs ${
                        index === 0 ? "sticky left-0 bg-white shadow-md" : ""
                      }`}
                      title={String(cell.getValue() || "")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
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
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
