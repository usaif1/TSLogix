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
          `${row.user.first_name} ${row.user.last_name}`,
        id: "userName",
      },
      {
        header: "Entry Order",
        accessorFn: (row: any) => {
          // NEW: Handle both direct entry_order and via entryOrderProduct
          if (row.entryOrderProduct?.entry_order?.entry_order_no) {
            return row.entryOrderProduct.entry_order.entry_order_no;
          }
          return row.entry_order?.entry_order_no || "-";
        },
        id: "entryOrderNo",
      },
      {
        header: "Departure Order",
        accessorFn: (row: any) => {
          // NEW: Handle both direct departure_order and via departureOrderProduct
          if (row.departureOrderProduct?.departure_order?.departure_order_no) {
            return row.departureOrderProduct.departure_order.departure_order_no;
          }
          return row.departure_order?.departure_order_no || "-";
        },
        id: "departureOrderNo",
      },
      {
        header: "Product",
        accessorFn: (row: any) => row.product.name,
        id: "productName",
      },
      {
        header: "Product Code",
        accessorFn: (row: any) => row.product.product_code || "-",
        id: "productCode",
      },
      {
        header: "Quantity Change",
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
          return <span className={color}>{change}</span>;
        },
      },
      {
        header: "Weight Change",
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
        header: "Packaging Type",
        accessorFn: (row: any) => {
          if (row.entryOrderProduct?.packaging_type) {
            return row.entryOrderProduct.packaging_type;
          }
          return "-";
        },
        id: "packagingType",
      },
      {
        header: "Audit Status",
        accessorFn: (row: any) => {
          if (row.entryOrderProduct?.audit_status) {
            return row.entryOrderProduct.audit_status;
          }
          return "-";
        },
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
          return <span className={color}>{type}</span>;
        }
      },
      {
        header: "Date",
        accessorKey: "timestamp",
        cell: (info) => new Date(info.getValue<string>()).toLocaleString(),
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
        <h1 className="text-2xl font-bold">Inventory Logs</h1>
        <div className="flex space-x-2">
          <Button onClick={handleViewSummaryClick}>
            View Summary
          </Button>
          <Button onClick={handleAssignProductClick}>
            + Assign Product
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
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