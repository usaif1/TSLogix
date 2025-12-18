/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { formatDate } from "@/utils/dateUtils";

// Props interface for pagination
interface PaginationState {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface DepartureRecordsTableProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  pageSize: number;
}

const DepartureRecordsTable: React.FC<DepartureRecordsTableProps> = ({
  pagination,
  onPageChange,
  isLoading,
  pageSize,
}) => {
  const { t } = useTranslation(['process', 'common']);
  const departureOrders = ProcessesStore.use.departureOrders();
  const navigate = useNavigate();
  
  // Navigate to departure audit
  const navigateToDepartureAudit = useCallback((orderCode: string) => {
    navigate(`/processes/departure/audit?orderNo=${encodeURIComponent(orderCode)}`);
  }, [navigate]);

  // Get order status color styling
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-gray-600";
      case "PENDING":
        return "bg-yellow-600";
      case "DISPATCHED":
        return "bg-blue-600";
      case "REVISION":
        return "bg-orange-600";
      default:
        return "bg-gray-400";
    }
  };



  const getStatusText = useCallback((status: string) => {
    if (!status) return 'Unknown';
    return t(`process:${status?.toLowerCase()}`, status);
  }, [t]);

  // Helper function to get main client/customer name
  const getClientName = useCallback((order: any) => {
    return order.client?.company_name || order.customer?.name || '-';
  }, []);

  // Helper function to get main supplier from products
  const getMainSupplier = useCallback((products: any[]) => {
    if (!products || products.length === 0) return "-";
    
    // Try to get from products_summary first, then fallback to products
    const suppliers = [...new Set(
      products.map(p => 
        p.supplier_info?.company_name || 
        p.supplier?.name || 
        p.supplier?.company_name
      ).filter(Boolean)
    )];
    
    if (suppliers.length === 1) {
      return suppliers[0];
    } else if (suppliers.length > 1) {
      return t('process:multiple_suppliers', `Multiple (${suppliers.length})`);
    } else {
      return "-";
    }
  }, [t]);

  // Helper function to get comprehensive totals
  const getComprehensiveTotals = useCallback((order: any) => {
    // Use comprehensive_summary if available, otherwise calculate from products
    if (order.comprehensive_summary) {
      return {
        quantity: order.comprehensive_summary.total_quantity || 0,
        weight: order.comprehensive_summary.total_weight || 0,
        value: order.comprehensive_summary.total_value || 0,
      };
    }
    
    // Fallback to calculating from products
    const totals = order.products?.reduce((acc: any, p: any) => {
      return {
        quantity: acc.quantity + (Number(p.requested_quantity) || 0),
        weight: acc.weight + (Number(p.requested_weight) || 0),
        value: acc.value + (Number(p.total_value) || 0),
      };
    }, { quantity: 0, weight: 0, value: 0 }) || { quantity: 0, weight: 0, value: 0 };
    
    return totals;
  }, []);
  
  const columns = useMemo(() => 
    createTableColumns([
      {
        accessor: 'departure_order_no',
        header: t('process:departure_order_no'),
        cell: (info: any) => {
          const order = info.row.original;
          return (
            <button
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              onClick={(e) => {
                e.stopPropagation();
                navigateToDepartureAudit(order.departure_order_no || order.departure_order_code);
              }}
            >
              {order.departure_order_no || order.departure_order_code}
            </button>
          );
        }
      },
      {
        accessor: 'dispatch_document_number',
        header: t('process:dispatch_document_number'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.dispatch_document_number || '-';
        }
      },
      {
        accessor: 'order_status',
        header: t('process:order_status'),
        cell: (info: any) => {
          const order = info.row.original;
          const status = order.order_status || order.status;
          return (
            <button
              className={`min-w-20 cursor-pointer border rounded-md flex justify-center items-center py-0.5 px-2 ${getOrderStatusColor(status)} text-white hover:opacity-80 transition-opacity`}
            >
              <p className="text-xs font-bold">
                {getStatusText(status)}
              </p>
            </button>
          );
        },
      },
      { 
        accessor: 'client_name', 
        header: t('process:client'),
        cell: (info: any) => {
          const order = info.row.original;
          const clientName = getClientName(order);
          return (
            <div className="truncate max-w-[160px]" title={clientName}>
              {clientName}
            </div>
          );
        }
      },
      { 
        accessor: 'total_products', 
        header: t('process:total_products'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.comprehensive_summary?.total_products || order.products?.length || 0;
        }
      },
      { 
        accessor: 'total_qty', 
        header: t('process:total_qty'),
        cell: (info: any) => {
          const order = info.row.original;
          const totals = getComprehensiveTotals(order);
          return totals.quantity.toLocaleString();
        }
      },
      { 
        accessor: 'total_weight', 
        header: t('process:total_weight_kg'),
        cell: (info: any) => {
          const order = info.row.original;
          const totals = getComprehensiveTotals(order);
          return `${Number(totals.weight).toFixed(2)} kg`;
        }
      },
      { 
        accessor: 'total_pallets', 
        header: t('process:total_pallets'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.total_pallets || 0;
        }
      },
      { 
        accessor: 'supplier', 
        header: t('process:supplier'),
        cell: (info: any) => {
          const order = info.row.original;
          const supplier = getMainSupplier(order.products_summary || order.products || []);
          return (
            <div className="truncate max-w-[160px]" title={supplier}>
              {supplier}
            </div>
          );
        }
      },
      { 
        accessor: 'departure_date', 
        header: t('process:departure_date'),
        cell: (info: any) => {
          const order = info.row.original;
          const date = order.departure_date_time || order.departure_date;
          return date ? formatDate(date) : '-';
        }
      },
      { 
        accessor: 'destination_point', 
        header: t('process:destination'),
        cell: (info: any) => {
          const order = info.row.original;
          const destination = order.destination_point || order.arrival_point || '-';
          return (
            <div className="truncate max-w-[140px]" title={destination}>
              {destination}
            </div>
          );
        }
      },
      { 
        accessor: 'transport_type', 
        header: t('process:transport_type'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.transport_type || '-';
        }
      },
      { 
        accessor: 'warehouse', 
        header: t('process:warehouse'),
        cell: (info: any) => {
          const order = info.row.original;
          const warehouse = order.warehouse?.name || '-';
          return (
            <div className="truncate max-w-[140px]" title={warehouse}>
              {warehouse}
            </div>
          );
        }
      },
      { 
        accessor: 'created_at', 
        header: t('process:created_date'),
        cell: (info: any) => {
          const order = info.row.original;
          const date = order.time_tracking?.created_at || order.registration_date || order.created_at;
          return date ? formatDate(date) : '-';
        }
      },
    ]), 
  [t, navigateToDepartureAudit, getStatusText, getClientName, getMainSupplier, getComprehensiveTotals]);

  // Transform data to ensure all calculations are safe
  const transformedData = useMemo(() => {
    return departureOrders.map(order => ({
      ...order,
      // Pre-calculate totals to avoid recalculation in each cell render
      calculated_totals: getComprehensiveTotals(order),
    }));
  }, [departureOrders, getComprehensiveTotals]);

  return (
    <div className="max-w-full h-full">
      <DataTable
        data={transformedData}
        columns={columns}
        showPagination={true}
        pageSize={pageSize}
        emptyMessage={t('common:no_data', 'No departure orders found')}
        onRowClick={(order: any) => {
          navigateToDepartureAudit(order.departure_order_no || order.departure_order_code);
        }}
        // Server-side pagination props
        serverPagination={pagination}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DepartureRecordsTable;