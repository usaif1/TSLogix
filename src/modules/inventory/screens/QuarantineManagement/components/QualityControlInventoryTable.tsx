import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuarantineInventoryItem, QualityControlStatus } from '../../../store';

interface QualityControlInventoryTableProps {
  data: QuarantineInventoryItem[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string | null) => void;
  showPagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

const getQualityStatusBadge = (status: QualityControlStatus, t: (key: string) => string) => {
  const statusConfig = {
    [QualityControlStatus.CUARENTENA]: {
      label: t('inventory:quarantine'),
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    },
    [QualityControlStatus.APROBADO]: {
      label: t('inventory:approved'),
      className: 'bg-green-100 text-green-800 border border-green-200',
    },
    [QualityControlStatus.DEVOLUCIONES]: {
      label: t('inventory:returns'),
      className: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
    [QualityControlStatus.CONTRAMUESTRAS]: {
      label: t('inventory:samples'),
      className: 'bg-purple-100 text-purple-800 border border-purple-200',
    },
    [QualityControlStatus.RECHAZADOS]: {
      label: t('inventory:rejected'),
      className: 'bg-red-100 text-red-800 border border-red-200',
    },
  };

  const config = statusConfig[status] || statusConfig[QualityControlStatus.CUARENTENA];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

const stickyColumns: number[] = []; // No sticky columns needed

function QualityControlInventoryTable({
  data,
  selectedItemId,
  onItemSelect,
  showPagination = true,
  pageSize = 20,
  emptyMessage = "No items found",
  className = "",
}: QualityControlInventoryTableProps) {
  const { t } = useTranslation(['inventory', 'common']);
  const tableRef = useRef<HTMLTableElement>(null);
  const [stickyOffsets, setStickyOffsets] = useState<number[]>([]);

  const columns: ColumnDef<QuarantineInventoryItem>[] = [
    {
      id: 'product',
      header: t('inventory:product_details'),
      cell: ({ row }) => (
        <div className="min-w-0 space-y-0.5">
          <div className="font-medium text-gray-900 text-xs truncate max-w-xs" title={row.original.entry_order_product.product.name}>
            {row.original.entry_order_product.product.name}
          </div>
          <div className="flex items-center gap-1">
            <code className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-mono">
              {row.original.entry_order_product.product.product_code}
            </code>
            <span className="text-blue-600 font-medium text-xs">
              #{row.original.entry_order_product.entry_order.entry_order_no.slice(-6)}
            </span>
          </div>
        </div>
      ),
      size: 220,
    },
    {
      id: 'inventory',
      header: t('inventory:inventory_details'),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <span className="font-medium text-yellow-700 text-xs">
              {Number(row.original.inventory_quantity).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div>{Number(row.original.package_quantity).toLocaleString()} pkg</div>
            <div>{Number(row.original.weight_kg).toFixed(1)} kg</div>
          </div>
        </div>
      ),
      size: 100,
    },
    {
      id: 'location',
      header: t('inventory:location_allocation'),
      cell: ({ row }) => (
        <div className="space-y-1">
          <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">
            {row.original.cell.row}.{String(row.original.cell.bay).padStart(2, '0')}.{String(row.original.cell.position).padStart(2, '0')}
          </code>
          <div className="text-xs text-gray-600 truncate">
            {row.original.cell.warehouse.name}
          </div>
        </div>
      ),
      size: 110,
    },
    {
      id: 'status',
      header: t('inventory:quality_status'),
      cell: ({ row }) => (
        <div className="space-y-1">
          {getQualityStatusBadge(row.original.quality_status, t)}
          <div className="text-xs text-gray-500">
            {new Date(row.original.allocated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      ),
      size: 100,
    },
    {
      id: 'timeline',
      header: t('inventory:timeline'),
      cell: ({ row }) => {
        const allocatedDate = new Date(row.original.allocated_at);
        const daysInStatus = Math.floor(
          (Date.now() - allocatedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const urgencyLevel = daysInStatus > 7 ? 'high' : daysInStatus > 3 ? 'medium' : 'low';
        const urgencyColors = {
          high: 'text-red-600 bg-red-50',
          medium: 'text-yellow-600 bg-yellow-50',
          low: 'text-green-600 bg-green-50'
        };

        return (
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${urgencyColors[urgencyLevel]}`}>
            <div className={`w-1 h-1 rounded-full ${urgencyLevel === 'high' ? 'bg-red-500' : urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            {daysInStatus}d
          </div>
        );
      },
      size: 70,
    },
  ];

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
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Scrollable table container - takes remaining space minus pagination */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table ref={tableRef} className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    style={{
                      ...(stickyColumns.includes(index)
                        ? {
                            position: "sticky",
                            left: stickyOffsets[stickyColumns.indexOf(index)] ?? 0,
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
              table.getRowModel().rows.map((row, rowIndex) => {
                const isSelected = selectedItemId === row.original.allocation_id;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 cursor-pointer ${
                      isSelected 
                        ? "bg-blue-100 hover:bg-blue-200" 
                        : rowIndex % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"
                    } transition-colors`}
                    onClick={() => {
                      if (isSelected) {
                        onItemSelect(null); // Deselect if already selected
                      } else {
                        onItemSelect(row.original.allocation_id); // Select the item
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <td
                        key={cell.id}
                        className="px-2 py-2 text-sm text-gray-700"
                        style={{
                          ...(stickyColumns.includes(index)
                            ? {
                                position: "sticky",
                                left: stickyOffsets[stickyColumns.indexOf(index)] ?? 0,
                                background: isSelected ? "#bfdbfe" : rowIndex % 2 === 0 ? "white" : "#F9FAFB",
                                zIndex: 10,
                              }
                            : {}),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                    <div className="text-lg font-medium mb-2">{t('inventory:no_items_found')}</div>
                    <div className="text-sm text-center max-w-md">
                      {emptyMessage}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {showPagination && data.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200">
          <div className="text-xs text-gray-600">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            -{Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )} of {data.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ←
            </button>
            <span className="text-xs text-gray-700 px-2">
              {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
            </span>
            <button
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QualityControlInventoryTable; 