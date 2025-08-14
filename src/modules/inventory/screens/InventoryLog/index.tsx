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
  const { 
    inventoryLogs, 
    loaders
  } = useInventoryLogStore();
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

  const getInventoryStatusInfo = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return { 
          text: t('inventory:available'), 
          color: "text-green-700 bg-green-50 border-green-200"
        };
      case "QUARANTINED":
        return { 
          text: t('inventory:quarantined'), 
          color: "text-yellow-700 bg-yellow-50 border-yellow-200"
        };
      case "DEPLETED":
        return { 
          text: t('inventory:depleted'), 
          color: "text-red-700 bg-red-50 border-red-200"
        };
      default:
        return { 
          text: status || t('inventory:unknown'), 
          color: "text-gray-700 bg-gray-50 border-gray-200"
        };
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return t('common:completed');
      case "PENDING":
        return t('common:pending');
      case "DISPATCHED":
        return t('inventory:dispatched');
      case "APPROVED":
        return t('common:approved');
      case "REJECTED":
        return t('common:rejected');
      case "IN_PROGRESS":
        return t('common:in_progress');
      case "FAILED":
        return t('common:failed');
      default:
        return status;
    }
  };

  // Clean, simple columns - Reduced for better viewport fit
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: t('inventory:client'),
        accessorFn: (row: any) => ({
          company_name: row.client_info?.company_name || row.client_info?.first_names || "-",
          client_type: row.client_info?.client_type || "-"
        }),
        id: "clientInfo",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{company_name: string, client_type: string}>();
          return (
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate" title={data.company_name}>
                {data.company_name}
              </div>
              <div className="text-xs text-gray-500 uppercase truncate" title={data.client_type}>
                {data.client_type}
              </div>
            </div>
          );
        },
        size: 140,
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
          change: row.quantity_change || 0,
          current: row.current_quantity || 0,
          weight_change: row.weight_change || 0,
          current_weight: row.current_weight || 0,
        }),
        id: "quantities",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{change: number, current: number, weight_change: number, current_weight: number}>();
          const type = info.row.original.movement_type;
          const changeColor =
            type === "ENTRY" ? "text-green-600" :
            type === "DEPARTURE" ? "text-red-600" :
            "text-orange-600";
          
          return (
            <div className="text-sm space-y-1">
              <div className={`${changeColor} font-medium`}>
                {data.change > 0 ? '+' : ''}{data.change} {t('inventory:units')}
              </div>
              <div className="text-xs text-gray-700">
                {t('inventory:current')}: {data.current.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {data.weight_change > 0 ? '+' : ''}{data.weight_change} kg → {data.current_weight} kg
              </div>
            </div>
          );
        },
        size: 140,
      },
      {
        header: t('inventory:location'),
        accessorFn: (row: any) => ({
          warehouse: row.warehouse?.name || "-",
          cell: row.cell_reference || "-"
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
        header: t('inventory:order_info'),
        accessorFn: (row: any) => ({
          order_no: row.order_no || null,
          order_status: row.order_status || null,
          order_type: row.order_type || null,
          destination_point: row.destination_point || null
        }),
        id: "orderInfo",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{order_no: string | null, order_status: string | null, order_type: string | null, destination_point: string | null}>();
          
          if (!data.order_no) {
            return <span className="text-gray-400">-</span>;
          }

          const statusColor = 
            data.order_status === "DISPATCHED" ? "bg-red-100 text-red-800 border-red-200" :
            data.order_status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            data.order_status === "COMPLETED" ? "bg-green-100 text-green-800 border-green-200" :
            "bg-gray-100 text-gray-800 border-gray-200";

          const typeColor = 
            data.order_type === "DEPARTURE" ? "text-red-700" :
            data.order_type === "ENTRY" ? "text-green-700" :
            "text-gray-700";

          return (
            <div className="text-xs space-y-1">
              <div className={`font-mono font-medium ${typeColor}`} title={data.order_no}>
                {data.order_no}
              </div>
              {data.order_status && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${statusColor}`}>
                  {getOrderStatusText(data.order_status)}
                </span>
              )}
              {data.destination_point && (
                <div className="text-xs text-gray-500" title={data.destination_point}>
                  {data.destination_point}
                </div>
              )}
            </div>
          );
        },
        size: 140,
      },
      {
        header: t('inventory:status'),
        accessorFn: (row: any) => ({
          quality: row.quality_status || null,
          inventory: row.inventory_status || null
        }),
        id: "status",
        cell: (info: CellContext<any, any>) => {
          const data = info.getValue<{quality: string | null, inventory: string | null}>();
          
          const qualityInfo = data.quality ? getQualityStatusInfo(data.quality) : null;
          const inventoryInfo = data.inventory ? getInventoryStatusInfo(data.inventory) : null;
          
          return (
            <div className="text-xs space-y-1">
              {qualityInfo && (
                <span className={`px-1.5 py-0.5 rounded text-xs border ${qualityInfo.color}`}>
                  {qualityInfo.text}
                </span>
              )}
              {inventoryInfo && (
                <span className={`px-1.5 py-0.5 rounded text-xs border ${inventoryInfo.color}`}>
                  {inventoryInfo.text}
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
            "ENTRY": { color: "text-green-600 bg-green-50 border-green-200", text: t('inventory:entry') },
            "DEPARTURE": { color: "text-red-600 bg-red-50 border-red-200", text: t('inventory:departure') },
            "TRANSFER": { color: "text-blue-600 bg-blue-50 border-blue-200", text: t('inventory:transfer') },
            "ADJUSTMENT": { color: "text-purple-600 bg-purple-50 border-purple-200", text: t('inventory:adjustment') }
          };
          const typeConfig = config[type as keyof typeof config] || { color: "text-gray-600 bg-gray-50 border-gray-200", text: type };
          
          return (
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeConfig.color}`}>
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
    ],
    [t, getMovementTypeText, getProductStatusText, getQualityStatusInfo, getInventoryStatusInfo, getOrderStatusText]
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