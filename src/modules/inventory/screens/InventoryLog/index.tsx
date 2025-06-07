/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { useInventoryLogStore } from "@/modules/inventory/store/index";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner/index";
import { InventoryTable } from "./components/index";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

const InventoryLog: React.FC = () => {
  const { t } = useTranslation(['inventory', 'common']);
  const { inventoryLogs, loaders } = useInventoryLogStore();
  const navigate = useNavigate();

  const loadLogs = useCallback(() => {
    InventoryLogService.fetchAllLogs().catch(console.error);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const isLoading = loaders["inventoryLogs/fetch-logs"];

  // ✅ Helper function to get movement type translation
  const getMovementTypeText = (type: string) => {
    switch (type) {
      case "ENTRY":
        return t('inventory:entry');
      case "DEPARTURE":
        return t('inventory:departure');
      case "TRANSFER":
        return t('inventory:transfer');
      case "ADJUSTMENT":
        return t('inventory:adjustment');
      default:
        return type || t('inventory:entry');
    }
  };

  // ✅ Helper function to get product status translation
  const getProductStatusText = (status: string) => {
    switch (status) {
      case "GOOD_CONDITION":
        return t('inventory:good_condition');
      case "DAMAGED":
        return t('inventory:damaged');
      case "EXPIRED":
        return t('inventory:expired');
      case "QUARANTINE":
        return t('inventory:quarantine');
      default:
        return status || t('inventory:good_condition');
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: t('inventory:user'),
        accessorFn: (row: any) =>
          `${row.user?.first_name || t('inventory:system')} ${row.user?.last_name || t('inventory:user')}`,
        id: "userName",
      },
      {
        header: t('inventory:entry_order'),
        accessorFn: (row: any) => {
          // ✅ Updated to handle mapped data structure
          return row.entry_order?.entry_order_no || "-";
        },
        id: "entryOrderNo",
      },
      {
        header: t('inventory:product'),
        accessorFn: (row: any) => row.product?.name || "-",
        id: "productName",
      },
      {
        header: t('inventory:product_code'),
        accessorFn: (row: any) => row.product?.product_code || "-",
        id: "productCode",
      },
      {
        header: t('inventory:inventory_quantity'),
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
        header: t('inventory:package_quantity'),
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
        header: t('inventory:weight_kg'),
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
        header: t('inventory:volume_m3'),
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
        header: t('inventory:cell_location'),
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
        header: t('inventory:warehouse'),
        accessorFn: (row: any) => row.warehouse?.name || "-",
        id: "warehouseName",
      },
      {
        header: t('inventory:product_status'),
        accessorKey: "product_status",
        cell: (info: CellContext<any, any>) => {
          const status = info.getValue<string>();
          const color = 
            status === "GOOD_CONDITION" ? "text-green-600" :
            status === "DAMAGED" ? "text-red-600" :
            status === "EXPIRED" ? "text-orange-600" :
            status === "QUARANTINE" ? "text-yellow-600" :
            "text-gray-600";
          return <span className={color}>{getProductStatusText(status || "GOOD_CONDITION")}</span>;
        },
      },
      {
        header: t('inventory:status_code'),
        accessorKey: "status_code",
        cell: (info: CellContext<any, any>) => {
          const code = info.getValue<number>();
          return <span className="text-gray-700">{code || "-"}</span>;
        },
      },
      { 
        header: t('inventory:movement_type'), 
        accessorKey: "movement_type",
        cell: (info: CellContext<any, any>) => {
          const type = info.getValue<string>();
          const color = 
            type === "ENTRY" ? "text-green-600" : 
            type === "DEPARTURE" ? "text-red-600" : 
            type === "TRANSFER" ? "text-blue-600" :
            type === "ADJUSTMENT" ? "text-purple-600" :
            "text-gray-600";
          return <span className={color}>{getMovementTypeText(type || "ENTRY")}</span>;
        }
      },
      {
        header: t('inventory:date'),
        accessorKey: "timestamp",
        cell: (info) => {
          const timestamp = info.getValue<string>();
          return timestamp ? new Date(timestamp).toLocaleString() : "-";
        },
      },
      {
        header: t('inventory:notes'),
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
    [t, getMovementTypeText, getProductStatusText]
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
        <h1 className="text-2xl font-bold">{t('inventory:inventory_overview')}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleViewSummaryClick}>
            {t('inventory:view_summary')}
          </Button>
          <Button onClick={handleAssignProductClick}>
            + {t('inventory:assign_product')}
          </Button>
        </div>
      </div>

      {/* ✅ Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          {t('inventory:current_inventory_status')}
        </h3>
        <p className="text-blue-700 text-sm">
          {t('inventory:inventory_status_description')}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('inventory:no_inventory_data')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('inventory:no_products_assigned_yet')}
          </p>
          <Button onClick={handleAssignProductClick}>
            {t('inventory:assign_first_product')}
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