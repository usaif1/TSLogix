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
      { accessor: 'origin.name', header: 'Palettes' },
      { accessor: 'supplier.name', header: 'Code' },
      { accessor: 'quantity', header: 'Quantity' },
      { accessor: 'weight', header: 'Weight' },
      { accessor: 'insuredValue', header: 'Insured Value' },
      { accessor: 'dateOfEntry', header: 'Date of Entry' },
      { accessor: 'entryTransferNote', header: 'Entry Transfer Note' },
      { accessor: 'presentation', header: 'Presentation' },
      { accessor: 'status', header: 'Status' },
      { accessor: 'type', header: 'Type' },
      { accessor: 'comments', header: 'Comments' },
      { accessor: 'documentType.name', header: 'Document Type' },
    ]), 
  []);

  return (
    <div className="p-4">
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