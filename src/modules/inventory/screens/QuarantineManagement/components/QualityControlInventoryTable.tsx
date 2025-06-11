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
        <div className="min-w-0 space-y-1">
          <div className="font-semibold text-gray-900 text-sm truncate max-w-xs" title={row.original.entry_order_product.product.name}>
            {row.original.entry_order_product.product.name}
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
              {row.original.entry_order_product.product.product_code}
            </code>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-blue-600 font-medium">
              {row.original.entry_order_product.entry_order.entry_order_no.slice(-8)}
            </span>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      id: 'inventory',
      header: t('inventory:inventory_details'),
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="font-bold text-yellow-700 text-sm">
                {Number(row.original.inventory_quantity).toLocaleString()} {t('inventory:units')}
              </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-gray-600">{Number(row.original.package_quantity).toLocaleString()} {t('inventory:pkg')}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9" />
              </svg>
              <span className="text-gray-600">{Number(row.original.weight_kg).toFixed(2)} {t('inventory:kg')}</span>
            </div>
          </div>
          {row.original.volume_m3 && Number(row.original.volume_m3) > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-gray-600">{Number(row.original.volume_m3).toFixed(2)} m³</span>
            </div>
          )}
        </div>
      ),
      size: 140,
    },
    {
      id: 'location',
      header: t('inventory:location_allocation'),
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <code className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-sm font-mono font-semibold">
              {row.original.cell.row}.{String(row.original.cell.bay).padStart(2, '0')}.{String(row.original.cell.position).padStart(2, '0')}
            </code>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gray-600 truncate max-w-24">{row.original.cell.warehouse.name}</span>
            </div>
            {row.original.allocated_by && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-500 truncate max-w-20">{row.original.allocated_by}</span>
              </div>
            )}
          </div>
        </div>
      ),
      size: 140,
    },
    {
      id: 'status',
      header: t('inventory:quality_status'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          {getQualityStatusBadge(row.original.quality_status, t)}
                      <div className="text-xs text-gray-500">
              {t('inventory:since')} {new Date(row.original.allocated_at).toLocaleDateString()}
            </div>
        </div>
      ),
      size: 120,
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
          high: 'text-red-600 bg-red-50 border-red-200',
          medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          low: 'text-green-600 bg-green-50 border-green-200'
        };

        return (
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[urgencyLevel]}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${urgencyLevel === 'high' ? 'bg-red-500' : urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              {daysInStatus} {t('inventory:days')}
            </div>
            <div className="text-xs text-gray-500">
              {allocatedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        );
      },
      size: 100,
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
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                        ? "bg-blue-50 hover:bg-blue-100" 
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
                        className="px-3 py-4 text-sm text-gray-700 whitespace-nowrap"
                        style={{
                          ...(stickyColumns.includes(index)
                            ? {
                                position: "sticky",
                                left: stickyOffsets[stickyColumns.indexOf(index)] ?? 0,
                                background: isSelected ? "#dbeafe" : rowIndex % 2 === 0 ? "white" : "#F9FAFB",
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
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {t('inventory:showing')}{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}
            </span>{" "}
            {t('inventory:of')} <span className="font-medium">{data.length}</span> {t('inventory:items')}
          </div>
          <div className="flex items-center gap-2">
                          <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t('inventory:previous')}
              </button>
              <span className="text-sm text-gray-700">
                {t('inventory:page')} {table.getState().pagination.pageIndex + 1} {t('inventory:of')} {table.getPageCount()}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t('inventory:next')}
              </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QualityControlInventoryTable; 