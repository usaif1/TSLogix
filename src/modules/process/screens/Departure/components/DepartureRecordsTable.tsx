/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const DepartureRecordsTable: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const departureOrders = ProcessesStore.use.departureOrders();
  
  const columns = useMemo(() => 
    createTableColumns([
      { accessor: 'departure_order_no', header: t('process:order') },
      { 
        accessor: 'product_code', 
        header: t('process:product_code'),
        cell: (info: any) => {
          const order = info.row.original;
          const productCodes = order.products?.map((p: any) => p.product_code).filter(Boolean) || [];
          return productCodes.length > 0 ? productCodes.join(', ') : '-';
        }
      },
      { 
        accessor: 'product_name', 
        header: t('process:product_name'),
        cell: (info: any) => {
          const order = info.row.original;
          const productNames = order.products?.map((p: any) => p.product?.name).filter(Boolean) || [];
          return productNames.length > 0 ? productNames.join(', ') : '-';
        }
      },
      { 
        accessor: 'total_qty', 
        header: t('process:total_qty'),
        cell: (info: any) => {
          const order = info.row.original;
          const totalQty = order.products?.reduce((sum: number, p: any) => {
            const qty = Number(p.requested_quantity) || 0;
            return sum + qty;
          }, 0) || 0;
          return totalQty;
        }
      },
      { 
        accessor: 'total_weight', 
        header: t('process:total_weight_kg'),
        cell: (info: any) => {
          const order = info.row.original;
          const totalWeight = order.products?.reduce((sum: number, p: any) => {
            const weight = Number(p.requested_weight) || 0;
            return sum + weight;
          }, 0) || 0;
          
          // Ensure totalWeight is a valid number before calling toFixed
          return typeof totalWeight === 'number' && !isNaN(totalWeight) 
            ? totalWeight.toFixed(2) 
            : '0.00';
        }
      },

      { 
        accessor: 'departure_date', 
        header: t('process:departure_date'),
        cell: (info: any) => {
          const order = info.row.original;
          const date = order.departure_date_time;
          return date ? new Date(date).toLocaleDateString() : '-';
        }
      },
      { 
        accessor: 'destination_point', 
        header: t('process:destination'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.destination_point || '-';
        }
      },
      { 
        accessor: 'presentation', 
        header: t('process:presentation'),
        cell: (info: any) => {
          const order = info.row.original;
          // Get unique presentations from products
          const presentations = order.products?.map((p: any) => p.presentation).filter(Boolean) || [];
          const uniquePresentations = [...new Set(presentations)];
          return uniquePresentations.length > 0 ? uniquePresentations.join(', ') : '-';
        }
      },
      { 
        accessor: 'status', 
        header: t('process:status'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.order_status || 'PENDING';
        }
      },
      { 
        accessor: 'type', 
        header: t('process:type'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.transport_type || '-';
        }
      },
      { 
        accessor: 'carrier_name', 
        header: t('process:carrier'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.carrier_name || '-';
        }
      },
      { 
        accessor: 'customer', 
        header: t('process:customer'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.customer?.name || '-';
        }
      },
      { 
        accessor: 'warehouse', 
        header: t('process:warehouse'),
        cell: (info: any) => {
          const order = info.row.original;
          return order.warehouse?.name || '-';
        }
      },
    ]), 
  [t]);

  // Transform data to ensure all calculations are safe
  const transformedData = useMemo(() => {
    return departureOrders.map(order => ({
      ...order,
      // Pre-calculate totals to avoid recalculation in each cell render
      calculated_total_qty: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.requested_quantity) || 0);
      }, 0) || 0,
      calculated_total_weight: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.requested_weight) || 0);
      }, 0) || 0,
      calculated_total_volume: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.requested_volume) || 0);
      }, 0) || 0,
    }));
  }, [departureOrders]);

  return (
    <div className="max-w-full h-full">
      <DataTable 
        data={transformedData} 
        columns={columns}
        showPagination={true}
        emptyMessage={t('common:no_data', 'No departure orders found')}
      />
    </div>
  );
};

export default DepartureRecordsTable;