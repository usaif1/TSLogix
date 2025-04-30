import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  showPagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

const stickyColumns = [0, 1];

function DataTable<T extends object>({
  data,
  columns,
  showPagination = false,
  pageSize = 10,
  emptyMessage = "No data found",
  className = "",
}: DataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [stickyOffsets, setStickyOffsets] = useState<number[]>([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (tableRef.current) {
      const ths = Array.from(tableRef.current.querySelectorAll("thead th"));
      let offset = 0;
      const offsets = stickyColumns.map((index) => {
        const th = ths[index];
        const width = th ? th.getBoundingClientRect().width : 0;
        const currentOffset = offset;
        offset += width;
        return currentOffset;
      });
      setStickyOffsets(offsets);
    }
  }, [columns?.length, data?.length]);

  return (
    <div className={`rounded-md shadow-sm border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full table-auto">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                    style={{
                      ...(stickyColumns.includes(index)
                        ? {
                            position: "sticky",
                            left:
                              stickyOffsets[stickyColumns.indexOf(index)] ?? 0,
                            background: "#F9FAFB",
                            zIndex: 20,
                          }
                        : {}),
                    }}
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

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  onClick={() => {
                    navigate(
                      `/processes/entry/audit?orderNo=${encodeURIComponent(
                        row.getValue("entry_order_no")
                      )}`
                    );
                  }}
                  key={row.id}
                  className={`cursor-pointer border-b border-gray-200 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors`}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs whitespace-nowrap"
                      style={{
                        ...(stickyColumns.includes(index)
                          ? {
                              position: "sticky",
                              left:
                                stickyOffsets[stickyColumns.indexOf(index)] ??
                                0,
                              background: "white",
                              zIndex: 10,
                            }
                          : {}),
                      }}
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
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 w-full">
          <div className="text-sm text-gray-700">
            Showing{" "}
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
            of <span className="font-medium">{data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
