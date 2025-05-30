/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useInventoryLogStore } from "@/modules/inventory/store";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { Button, Text, LoaderSync } from "@/components";
import { InventoryTable } from "../InventoryLog/components";
import { ColumnDef, CellContext } from "@tanstack/react-table";

const InventorySummary: React.FC = () => {
  const navigate = useNavigate();
  const {
    warehouses,
    inventorySummary,
    loaders,
  } = useInventoryLogStore();

  const [filters, setFilters] = useState({
    warehouse_id: null as { value: string; label: string } | null,
    status: null as { value: string; label: string } | null,
  });

  const isLoadingWarehouses = loaders["inventoryLogs/fetch-warehouses"];
  const isLoadingSummary = loaders["inventoryLogs/fetch-inventory-summary"];

  // Load warehouses on mount
  useEffect(() => {
    InventoryLogService.fetchWarehouses();
    InventoryLogService.fetchInventorySummary();
  }, []);

  // Refresh summary when filters change
  useEffect(() => {
    const filterParams: any = {};
    if (filters.warehouse_id?.value) filterParams.warehouse_id = filters.warehouse_id.value;
    if (filters.status?.value) filterParams.status = filters.status.value;
    
    InventoryLogService.fetchInventorySummary(filterParams);
  }, [filters]);

  const handleFilterChange = useCallback((filterName: string, selectedOption: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: selectedOption,
    }));
  }, []);

  const warehouseOptions = useMemo(() => 
    warehouses.map((wh: any) => ({
      value: wh.warehouse_id,
      label: wh.name,
    })), [warehouses]
  );

  const statusOptions = [
    { value: "AVAILABLE", label: "Available" },
    { value: "OCCUPIED", label: "Occupied" },
    { value: "RESERVED", label: "Reserved" },
  ];

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: "Product",
        accessorFn: (row: any) => row.product?.name || "-",
        id: "productName",
      },
      {
        header: "Product Code",
        accessorFn: (row: any) => row.product?.product_code || "-",
        id: "productCode",
      },
      {
        header: "Entry Order",
        accessorFn: (row: any) => row.entryOrderProduct?.entry_order?.entry_order_no || "-",
        id: "entryOrderNo",
        cell: (info: CellContext<any, any>) => {
          const orderNo = info.getValue<string>();
          return orderNo !== "-" ? (
            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
              {orderNo}
            </span>
          ) : "-";
        },
      },
      {
        header: "Warehouse",
        accessorFn: (row: any) => row.warehouse?.name || "-",
        id: "warehouseName",
      },
      {
        header: "Cell Location",
        accessorFn: (row: any) => {
          const cell = row.warehouseCell;
          if (!cell) return "-";
          return `${cell.row}.${String(cell.bay).padStart(2, "0")}.${String(cell.position).padStart(2, "0")}`;
        },
        id: "cellLocation",
      },
      {
        header: "Packaging Qty",
        accessorKey: "packaging_quantity",
        cell: (info: CellContext<any, any>) => {
          const qty = info.getValue<number>();
          return <span className="font-medium">{qty || 0}</span>;
        },
      },
      {
        header: "Weight (kg)",
        accessorKey: "weight",
        cell: (info: CellContext<any, any>) => {
          const weight = info.getValue<number>();
          return <span className="font-medium">{Number(weight || 0).toFixed(2)}</span>;
        },
      },
      {
        header: "Volume (m³)",
        accessorKey: "volume",
        cell: (info: CellContext<any, any>) => {
          const volume = info.getValue<number>();
          return volume ? <span className="font-medium">{Number(volume).toFixed(2)}</span> : "-";
        },
      },
      {
        header: "Packaging Type",
        accessorKey: "packaging_type",
        cell: (info: CellContext<any, any>) => {
          const type = info.getValue<string>();
          return type || "-";
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info: CellContext<any, any>) => {
          const status = info.getValue<string>();
          const color = 
            status === "AVAILABLE" ? "text-green-600" :
            status === "OCCUPIED" ? "text-blue-600" :
            status === "RESERVED" ? "text-yellow-600" :
            "text-gray-600";
          return <span className={color}>{status || "Unknown"}</span>;
        },
      },
      {
        header: "Audit Status",
        accessorFn: (row: any) => row.entryOrderProduct?.audit_status || "-",
        id: "auditStatus",
        cell: (info: CellContext<any, any>) => {
          const status = info.getValue<string>();
          const color = 
            status === "PASSED" ? "text-green-600" :
            status === "FAILED" ? "text-red-600" :
            status === "PENDING" ? "text-yellow-600" :
            "text-gray-600";
          return <span className={color}>{status}</span>;
        },
      },
      {
        header: "Expiration Date",
        accessorKey: "expiration_date",
        cell: (info: CellContext<any, any>) => {
          const date = info.getValue<string>();
          if (!date) return "-";
          
          try {
            const expirationDate = new Date(date);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let colorClass = "text-gray-600";
            if (daysUntilExpiry <= 7) colorClass = "text-red-600";
            else if (daysUntilExpiry <= 30) colorClass = "text-yellow-600";
            
            return (
              <span className={colorClass}>
                {expirationDate.toLocaleDateString()}
                {daysUntilExpiry <= 30 && (
                  <span className="block text-xs">
                    ({daysUntilExpiry} days)
                  </span>
                )}
              </span>
            );
          } catch (error) {
            return <span className="text-gray-600">{date}</span>;
          }
        },
      },
    ],
    []
  );

  // Calculate summary statistics with proper null/undefined handling
  const summaryStats = useMemo(() => {
    if (!Array.isArray(inventorySummary) || inventorySummary.length === 0) {
      return {
        totalProducts: 0,
        totalPackaging: 0,
        totalWeight: 0,
        totalVolume: 0,
        statusBreakdown: {} as Record<string, number>,
      };
    }

    const stats = {
      totalProducts: inventorySummary.length,
      totalPackaging: 0,
      totalWeight: 0,
      totalVolume: 0,
      statusBreakdown: {} as Record<string, number>,
    };

    inventorySummary.forEach(item => {
      // Safe numeric conversions
      const packagingQty = Number(item?.packaging_quantity || 0);
      const weight = Number(item?.weight || 0);
      const volume = Number(item?.volume || 0);
      const status = item?.status || "Unknown";

      stats.totalPackaging += packagingQty;
      stats.totalWeight += weight;
      stats.totalVolume += volume;

      // Count by status
      stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
    });

    return stats;
  }, [inventorySummary]);

  if (isLoadingWarehouses) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderSync loaderText="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Summary</h1>
          <div className="flex space-x-2">
            <Button onClick={() => navigate("/inventory/assign-product")}>
              Assign Product
            </Button>
            <Button onClick={() => navigate("/inventory")}>
              View Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4">
              Filters
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse
                </label>
                <Select
                  options={warehouseOptions}
                  value={filters.warehouse_id}
                  onChange={(option) => handleFilterChange("warehouse_id", option)}
                  placeholder="All warehouses"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={filters.status}
                  onChange={(option) => handleFilterChange("status", option)}
                  placeholder="All statuses"
                  isClearable
                />
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4">
              Summary Statistics
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <Text size="2xl" weight="font-bold" additionalClass="text-blue-600">
                  {summaryStats.totalProducts}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">Total Inventory Items</Text>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <Text size="2xl" weight="font-bold" additionalClass="text-green-600">
                  {summaryStats.totalPackaging}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">Total Packages</Text>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <Text size="2xl" weight="font-bold" additionalClass="text-purple-600">
                  {summaryStats.totalWeight.toFixed(2)}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">Total Weight (kg)</Text>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <Text size="2xl" weight="font-bold" additionalClass="text-orange-600">
                  {summaryStats.totalVolume.toFixed(2)}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">Total Volume (m³)</Text>
              </div>
            </div>

            {/* Status Breakdown */}
            {Object.keys(summaryStats.statusBreakdown).length > 0 && (
              <div className="mt-4">
                <Text weight="font-medium" additionalClass="mb-2">Status Breakdown:</Text>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summaryStats.statusBreakdown).map(([status, count]) => (
                    <span
                      key={status}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status === "AVAILABLE" ? "bg-green-100 text-green-800" :
                        status === "OCCUPIED" ? "bg-blue-100 text-blue-800" :
                        status === "RESERVED" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-sm">
            {isLoadingSummary ? (
              <div className="flex justify-center items-center py-8">
                <LoaderSync loaderText="Loading inventory summary..." />
              </div>
            ) : inventorySummary.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2m-2 0h2m-2 0v3M6 13h2m2 0H6m2 0v3" />
                  </svg>
                </div>
                <Text size="lg" additionalClass="text-gray-500 mb-2">No inventory items found</Text>
                <Text size="sm" additionalClass="text-gray-400">Try adjusting your filters or assign some products to cells first</Text>
                <div className="mt-4">
                  <Button onClick={() => navigate("/inventory/assign-product")}>
                    Assign Product to Cell
                  </Button>
                </div>
              </div>
            ) : (
              <InventoryTable
                columns={columns}
                data={inventorySummary}
              />
            )}
          </div>

          {/* Bottom spacing for scroll */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default InventorySummary;