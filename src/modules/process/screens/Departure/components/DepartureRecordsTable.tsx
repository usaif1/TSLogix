import React, { useMemo } from "react";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const EntryRecordsTable: React.FC = () => {
  const departureOrders = ProcessesStore.use.departureOrders();
  
  const columns = useMemo(() => 
    createTableColumns([
      { accessor: 'departure_order_no', header: 'Order' },
      { accessor: 'palettes', header: 'Palettes' },
      { accessor: 'total_qty', header: 'Quantity' },
      { accessor: 'total_weight', header: 'Weight' },
      { accessor: 'insured_value', header: 'Insured Value' },
      { accessor: 'departure_date', header: 'Date of Departure' },
      { accessor: 'departure_transfer_note', header: 'Departure Transfer Note' },
      { accessor: 'presentation', header: 'Presentation' },
      { accessor: 'status', header: 'Status' },
      { accessor: 'type', header: 'Type' },
      { accessor: 'comments', header: 'Comments' },
      { accessor: 'documentType.name', header: 'Document Type' },
    ]), 
  []);

  return (
    <div className="max-w-full h-full">
      <DataTable 
        data={departureOrders} 
        columns={columns}
        showPagination={true}
        emptyMessage="No entry orders found"
      />
    </div>
  );
};

export default EntryRecordsTable;