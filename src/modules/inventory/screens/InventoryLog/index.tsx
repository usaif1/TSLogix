/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useMemo } from "react";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { useInventoryLogStore } from "@/modules/inventory/store/index";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner/index";
import { InventoryTable } from "./components/index";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

const InventoryLog: React.FC = () => {
  const { inventoryLogs, loaders } = useInventoryLogStore();
  const navigate = useNavigate();

  const loadLogs = useCallback(() => {
    InventoryLogService.fetchAllLogs().catch(console.error);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const isLoading = loaders["inventoryLogs/fetch-logs"];

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: "User",
        accessorFn: (row: any) =>
          `${row.user?.first_name || "System"} ${row.user?.last_name || "User"}`,
        id: "userName",
      },
      {
        header: "Entry Order",
        accessorFn: (row: any) => {
          // ✅ Updated to handle mapped data structure
          return row.entry_order?.entry_order_no || "-";
        },
        id: "entryOrderNo",
      },
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
        header: "Inventory Quantity",
        accessorKey: "quantity_change",
        cell: (info: CellContext<any, any>) => {
          const change = info.getValue<number>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY"
              ? "text-green-600 font-bold"
              : type === "DEPARTURE"
              ? "text-red-600 font-bold"
              : "text-gray-800";
          return <span className={color}>{change || 0}</span>;
        },
      },
      {
        header: "Package Quantity",
        accessorKey: "package_change",
        cell: (info: CellContext<any, any>) => {
          const change = info.getValue<number>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY"
              ? "text-green-600 font-bold"
              : type === "DEPARTURE"
              ? "text-red-600 font-bold"
              : "text-gray-800";
          return <span className={color}>{change || 0}</span>;
        },
      },
      {
        header: "Weight (kg)",
        accessorKey: "weight_change",
        cell: (info: CellContext<any, any>) => {
          const change = info.getValue<number>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY"
              ? "text-green-600 font-bold"
              : type === "DEPARTURE"
              ? "text-red-600 font-bold"
              : "text-gray-800";
          return <span className={color}>{change ? `${change} kg` : "-"}</span>;
        },
      },
      {
        header: "Volume (m³)",
        accessorKey: "volume_change",
        cell: (info: CellContext<any, any>) => {
          const change = info.getValue<number>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY"
              ? "text-green-600 font-bold"
              : type === "DEPARTURE"
              ? "text-red-600 font-bold"
              : "text-gray-800";
          return <span className={color}>{change ? `${change} m³` : "-"}</span>;
        },
      },
      {
        header: "Cell Location",
        accessorFn: (row: any) => {
          if (row.warehouseCell) {
            const cell = row.warehouseCell;
            return `${cell.row}.${String(cell.bay).padStart(2, "0")}.${String(cell.position).padStart(2, "0")}`;
          }
          return "-";
        },
        id: "cellLocation",
      },
      {
        header: "Warehouse",
        accessorFn: (row: any) => row.warehouse?.name || "-",
        id: "warehouseName",
      },
      {
        header: "Product Status",
        accessorKey: "product_status",
        cell: (info: CellContext<any, any>) => {
          const status = info.getValue<string>();
          const color = 
            status === "GOOD_CONDITION" ? "text-green-600" :
            status === "DAMAGED" ? "text-red-600" :
            status === "EXPIRED" ? "text-orange-600" :
            status === "QUARANTINE" ? "text-yellow-600" :
            "text-gray-600";
          return <span className={color}>{status || "GOOD_CONDITION"}</span>;
        },
      },
      {
        header: "Status Code",
        accessorKey: "status_code",
        cell: (info: CellContext<any, any>) => {
          const code = info.getValue<number>();
          return <span className="text-gray-700">{code || "-"}</span>;
        },
      },
      { 
        header: "Movement Type", 
        accessorKey: "movement_type",
        cell: (info: CellContext<any, any>) => {
          const type = info.getValue<string>();
          const color = 
            type === "ENTRY" ? "text-green-600" : 
            type === "DEPARTURE" ? "text-red-600" : 
            type === "TRANSFER" ? "text-blue-600" :
            type === "ADJUSTMENT" ? "text-purple-600" :
            "text-gray-600";
          return <span className={color}>{type || "ENTRY"}</span>;
        }
      },
      {
        header: "Date",
        accessorKey: "timestamp",
        cell: (info) => {
          const timestamp = info.getValue<string>();
          return timestamp ? new Date(timestamp).toLocaleString() : "-";
        },
      },
      {
        header: "Notes",
        accessorKey: "notes",
        cell: (info) => {
          const notes = info.getValue<string>();
          return notes ? (
            <span className="text-sm text-gray-600 truncate" title={notes}>
              {notes.length > 50 ? `${notes.substring(0, 50)}...` : notes}
            </span>
          ) : "-";
        },
      },
    ],
    []
  );

  const handleAssignProductClick = () => {
    navigate("/inventory/allocate");
  };

  const handleViewSummaryClick = () => {
    navigate("/inventory/summary");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Overview</h1>
        <div className="flex space-x-2">
          <Button onClick={handleViewSummaryClick}>
            View Summary
          </Button>
          <Button onClick={handleAssignProductClick}>
            + Assign Product
          </Button>
        </div>
      </div>

      {/* ✅ Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Current Inventory Status</h3>
        <p className="text-blue-700 text-sm">
          Showing current inventory allocations and their status. This data represents products currently assigned to warehouse cells.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : inventoryLogs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Data</h3>
          <p className="text-gray-500 mb-4">
            No products have been assigned to warehouse cells yet.
          </p>
          <Button onClick={handleAssignProductClick}>
            Assign Your First Product
          </Button>
        </div>
      ) : (
        <InventoryTable
          columns={columns}
          data={inventoryLogs}
        />
      )}
    </div>
  );
};

export default InventoryLog;