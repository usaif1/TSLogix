import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  emptyMessage?: string;
  className?: string;
}

const stickyColumns = [0, 1];

function DataTable<T extends object>({
  data,
  columns,
  emptyMessage,
  className = "",
}: DataTableProps<T>) {
  const { t } = useTranslation(['process', 'common']);
  const tableRef = useRef<HTMLTableElement>(null);
  const [stickyOffsets, setStickyOffsets] = useState<number[]>([]);
  const navigate = useNavigate();

  // Use translated empty message if none provided
  const translatedEmptyMessage = emptyMessage || t('process:no_entry_orders');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Remove pagination - show all data
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
    <div className={`rounded-md shadow-sm border border-gray-200 h-full flex flex-col ${className}`}>
      <div className="overflow-auto flex-1">
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
                  {translatedEmptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Show total count instead of pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 w-full">
          <div className="text-sm text-gray-700">
            {t('common:total')}: <span className="font-medium">{data.length}</span> {t('process:orders')}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
