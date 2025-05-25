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

  const isAdding = loaders["inventoryLogs/add-inventory"];

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
        accessorFn: (row: any) => row.entry_order?.entry_order_no || "-",
        id: "entryOrderNo",
      },
      {
        header: "Departure Order",
        accessorFn: (row: any) => row.departure_order?.departure_order_no || "-",
        id: "departureOrderNo",
      },
      {
        header: "Product",
        accessorFn: (row: any) => row.product.name,
        id: "productName",
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
          return <span className={color}>{change}</span>;
        },
      },
      { 
        header: "Type", 
        accessorKey: "movement_type",
        cell: (info: CellContext<any, any>) => {
          const type = info.getValue<string>();
          const color = type === "ENTRY" ? "text-green-600" : type === "DEPARTURE" ? "text-red-600" : "text-gray-600";
          return <span className={color}>{type}</span>;
        }
      },
      {
        header: "Date",
        accessorKey: "timestamp",
        cell: (info) => new Date(info.getValue<string>()).toLocaleString(),
      },
    ],
    []
  );

  const handleAddClick = () => {
    navigate("/inventory/allocate");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Logs</h1>
        <Button onClick={handleAddClick}>+ Allocate Order</Button>
      </div>
      {isAdding ? (
        <Spinner />
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
