/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { useInventoryLogStore, QualityControlStatus } from "@/modules/inventory/store/index";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner/index";
import { InventoryTable } from "./components";
import { CellContext, ColumnDef } from "@tanstack/react-table";

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

  // Helper functions
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

  const getQualityStatusInfo = (status: QualityControlStatus | string) => {
    switch (status) {
      case "CUARENTENA":
        return { 
          text: t('inventory:quarantine'), 
          color: "text-yellow-700 bg-yellow-50 border-yellow-200"
        };
      case "APROBADO":
        return { 
          text: t('inventory:approved'), 
          color: "text-green-700 bg-green-50 border-green-200"
        };
      case "DEVOLUCIONES":
        return { 
          text: t('inventory:returns'), 
          color: "text-blue-700 bg-blue-50 border-blue-200"
        };
      case "CONTRAMUESTRAS":
        return { 
          text: t('inventory:samples'), 
          color: "text-purple-700 bg-purple-50 border-purple-200"
        };
      case "RECHAZADOS":
        return { 
          text: t('inventory:rejected'), 
          color: "text-red-700 bg-red-50 border-red-200"
        };
      default:
        return { 
          text: status || t('inventory:unknown'), 
          color: "text-gray-700 bg-gray-50 border-gray-200"
        };
    }
  };

  // Clean, simple columns - Reduced for better viewport fit
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: t('inventory:user'),
        accessorFn: (row: any) =>
          `${row.user?.first_name || t('inventory:system')} ${row.user?.last_name || ''}`.trim(),
        id: "userName",
        size: 120,
      },
      {
        header: t('inventory:product_info'),
        accessorFn: (row: any) => ({
          name: row.product?.name || "-",
          code: row.product?.product_code || "-"
        }),
        id: "productInfo",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{name: string, code: string}>();
          return (
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate" title={data.name}>
                {data.name}
              </div>
              <div className="text-xs text-gray-500 truncate" title={data.code}>
                {data.code}
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        header: t('inventory:quantities'),
        accessorFn: (row: any) => ({
          inventory: row.quantity_change || 0,
          packages: row.package_change || 0,
        }),
        id: "quantities",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{inventory: number, packages: number}>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY" ? "text-green-600" :
            type === "DEPARTURE" ? "text-red-600" :
            "text-gray-800";
          return (
            <div className={`text-sm ${color} font-medium`}>
              <div>{data.inventory} units</div>
              <div className="text-xs">{data.packages} pkg</div>
            </div>
          );
        },
        size: 100,
      },
      {
        header: t('inventory:location'),
        accessorFn: (row: any) => ({
          warehouse: row.warehouse?.name || "-",
          cell: row.warehouseCell ? 
            `${row.warehouseCell.row}.${String(row.warehouseCell.bay).padStart(2, "0")}.${String(row.warehouseCell.position).padStart(2, "0")}` 
            : "-"
        }),
        id: "location",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{warehouse: string, cell: string}>();
          return (
            <div className="text-sm">
              <div className="font-medium truncate" title={data.warehouse}>
                {data.warehouse}
              </div>
              <div className="text-xs text-gray-500">{data.cell}</div>
            </div>
          );
        },
        size: 140,
      },
      {
        header: t('inventory:status'),
        accessorFn: (row: any) => ({
          product: row.product_status || "GOOD_CONDITION",
          quality: row.quality_status || null
        }),
        id: "status",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{product: string, quality: string | null}>();
          
          const productColor = 
            data.product === "GOOD_CONDITION" ? "text-green-600" :
            data.product === "DAMAGED" ? "text-red-600" :
            data.product === "EXPIRED" ? "text-orange-600" :
            data.product === "QUARANTINE" ? "text-yellow-600" :
            "text-gray-600";

          const qualityInfo = data.quality ? getQualityStatusInfo(data.quality) : null;
          
          return (
            <div className="text-xs space-y-1">
              <div className={`${productColor} font-medium`}>
                {getProductStatusText(data.product)}
              </div>
              {qualityInfo && (
                <span className={`px-1.5 py-0.5 rounded text-xs border ${qualityInfo.color}`}>
                  {qualityInfo.text}
                </span>
              )}
            </div>
          );
        },
        size: 120,
      },
      { 
        header: t('inventory:movement_type'), 
        accessorKey: "movement_type",
        cell: (info: CellContext<any, any>) => {
          const type = info.getValue<string>();
          const config = {
            "ENTRY": { color: "text-green-600 bg-green-50", text: t('inventory:entry') },
            "DEPARTURE": { color: "text-red-600 bg-red-50", text: t('inventory:departure') },
            "TRANSFER": { color: "text-blue-600 bg-blue-50", text: t('inventory:transfer') },
            "ADJUSTMENT": { color: "text-purple-600 bg-purple-50", text: t('inventory:adjustment') }
          };
          const typeConfig = config[type as keyof typeof config] || { color: "text-gray-600 bg-gray-50", text: type };
          
          return (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.text}
            </span>
          );
        },
        size: 100,
      },
      {
        header: t('inventory:date_time'),
        accessorKey: "timestamp",
        cell: (info) => {
          const timestamp = info.getValue<string>();
          if (!timestamp) return "-";
          
          const date = new Date(timestamp);
          return (
            <div className="text-sm">
              <div className="font-medium">{date.toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
            </div>
          );
        },
        size: 110,
      },
      {
        header: t('inventory:notes'),
        accessorKey: "notes",
        cell: (info) => {
          const notes = info.getValue<string>();
          return notes ? (
            <div className="text-sm text-gray-600 max-w-32 truncate" title={notes}>
              {notes}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
        size: 130,
      },
    ],
    [t, getMovementTypeText, getProductStatusText, getQualityStatusInfo]
  );

  const handleNavigateToQuarantine = () => navigate("/inventory/quarantine");
  const handleNavigateToAllocate = () => navigate("/inventory/allocate");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed width with overflow handling */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {t('inventory:inventory_log')}
            </h1>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button onClick={handleNavigateToQuarantine}>
              {t('inventory:quality_control')}
            </Button>
            <Button onClick={handleNavigateToAllocate}>
              + {t('inventory:assign_product')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Proper overflow handling */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : inventoryLogs.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('inventory:no_inventory_data')}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('inventory:no_products_assigned_yet')}
            </p>
            <Button onClick={handleNavigateToAllocate}>
              {t('inventory:assign_first_product')}
            </Button>
          </div>
        ) : (
          <InventoryTable
            columns={columns}
            data={inventoryLogs}
            maxBodyHeight="calc(100vh - 200px)"
          />
        )}
      </div>
    </div>
  );
};

export default InventoryLog;