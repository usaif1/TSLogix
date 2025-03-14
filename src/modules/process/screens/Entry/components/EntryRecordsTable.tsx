import React, { useMemo } from "react";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const EntryRecordsTable: React.FC = () => {
  const entryOrders = ProcessesStore.use.entryOrders();
  
  const columns = useMemo(() => 
    createTableColumns([
      { accessor: 'entry_order_no', header: 'Order' },
      { accessor: 'palettes', header: 'Palettes' },
      { accessor: 'total_qty', header: 'Quantity' },
      { accessor: 'total_weight', header: 'Weight' },
      { accessor: 'insured_value', header: 'Insured Value' },
      { accessor: 'entry_date', header: 'Date of Entry' },
      { accessor: 'entry_transfer_note', header: 'Entry Transfer Note' },
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
        data={entryOrders} 
        columns={columns}
        showPagination={true}
        emptyMessage="No entry orders found"
      />
    </div>
  );
};

export default EntryRecordsTable;