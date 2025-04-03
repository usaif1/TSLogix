import React, { useMemo } from "react";

// store
import { MaintenanceStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const EntryRecordsTable: React.FC = () => {
  const suppliers = MaintenanceStore.use.suppliers();

  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "name", header: "Supplier" },
        { accessor: "email", header: "Supplier Email" },
        { accessor: "phone", header: "Supplier Phone" },
        { accessor: "address", header: "Address" },
        { accessor: "city", header: "City" },
        {
          accessor: "country", // still just a string
          header: "Country",
          cell: ({ row }) => row.original.country?.name || "", // custom cell renderer
        },
        { accessor: "ruc", header: "RUC" },
      ]),
    []
  );

  return (
    <div className="max-w-full h-full">
      <DataTable
        data={suppliers}
        columns={columns}
        showPagination={true}
        emptyMessage="No entry orders found"
      />
    </div>
  );
};

export default EntryRecordsTable;
