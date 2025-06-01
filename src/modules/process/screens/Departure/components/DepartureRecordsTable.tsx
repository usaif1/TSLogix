/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const DepartureRecordsTable: React.FC = () => {
  const departureOrders = ProcessesStore.use.departureOrders();
  
  const columns = useMemo(() => 
    createTableColumns([
      { accessor: 'departure_order_no', header: 'Order' },
      { 
        accessor: 'total_qty', 
        header: 'Total Qty',
        cell: (info: any) => {
          const order = info.row.original;
          const totalQty = order.products?.reduce((sum: number, p: any) => {
            const qty = Number(p.total_qty) || 0;
            return sum + qty;
          }, 0) || 0;
          return totalQty;
        }
      },
      { 
        accessor: 'total_weight', 
        header: 'Total Weight (kg)',
        cell: (info: any) => {
          const order = info.row.original;
          const totalWeight = order.products?.reduce((sum: number, p: any) => {
            const weight = Number(p.total_weight) || 0;
            return sum + weight;
          }, 0) || 0;
          
          // Ensure totalWeight is a valid number before calling toFixed
          return typeof totalWeight === 'number' && !isNaN(totalWeight) 
            ? totalWeight.toFixed(2) 
            : '0.00';
        }
      },
      { 
        accessor: 'insured_value', 
        header: 'Insured Value',
        cell: (info: any) => {
          const order = info.row.original;
          const totalInsuredValue = order.products?.reduce((sum: number, p: any) => {
            const value = Number(p.insured_value) || 0;
            return sum + value;
          }, 0) || 0;
          
          return typeof totalInsuredValue === 'number' && !isNaN(totalInsuredValue)
            ? totalInsuredValue.toFixed(2)
            : '0.00';
        }
      },
      { 
        accessor: 'departure_date', 
        header: 'Date of Departure',
        cell: (info: any) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : '-';
        }
      },
      { accessor: 'departure_transfer_note', header: 'Departure Transfer Note' },
      { 
        accessor: 'presentation', 
        header: 'Presentation',
        cell: (info: any) => {
          const order = info.row.original;
          // Since presentation might be product-specific, show count of products
          return order.products?.length || 0;
        }
      },
      { 
        accessor: 'status', 
        header: 'Status',
        cell: () => 'Active' // Default status since it's not in the schema
      },
      { 
        accessor: 'type', 
        header: 'Type',
        cell: (info: any) => {
          const order = info.row.original;
          // Get unique types from products
          const types = order.products?.map((p: any) => p.type).filter(Boolean) || [];
          return types.length > 0 ? types.join(', ') : '-';
        }
      },
      { 
        accessor: 'comments', 
        header: 'Comments',
        cell: (info: any) => {
          const order = info.row.original;
          return order.observation || '-';
        }
      },
      { accessor: 'documentType.name', header: 'Document Type' },
    ]), 
  []);

  // Transform data to ensure all calculations are safe
  const transformedData = useMemo(() => {
    return departureOrders.map(order => ({
      ...order,
      // Pre-calculate totals to avoid recalculation in each cell render
      calculated_total_qty: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.total_qty) || 0);
      }, 0) || 0,
      calculated_total_weight: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.total_weight) || 0);
      }, 0) || 0,
      calculated_total_volume: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.total_volume) || 0);
      }, 0) || 0,
      calculated_insured_value: order.products?.reduce((sum: number, p: any) => {
        return sum + (Number(p.insured_value) || 0);
      }, 0) || 0,
    }));
  }, [departureOrders]);

  return (
    <div className="max-w-full h-full">
      <DataTable 
        data={transformedData} 
        columns={columns}
        showPagination={true}
        emptyMessage="No departure orders found"
      />
    </div>
  );
};

export default DepartureRecordsTable;