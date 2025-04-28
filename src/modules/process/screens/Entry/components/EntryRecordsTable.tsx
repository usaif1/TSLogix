/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// store
import { ProcessesStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { formatDate } from "@/utils/dateUtils";

const EntryRecordsTable: React.FC = () => {
  const entryOrders = ProcessesStore.use.entryOrders();
  const navigate = useNavigate();

  const actions = async (orderCode: string) => {
    navigate(`/processes/entry/audit?orderNo=${encodeURIComponent(orderCode)}`);
  };

  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "entry_order_no", header: "Order" },
        { accessor: "palettes", header: "Palettes" },
        { accessor: "total_qty", header: "Quantity" },
        { accessor: "total_weight", header: "Weight" },
        { accessor: "insured_value", header: "Insured Value" },
        {
          accessor: "entry_date",
          header: "Date of Entry",
          cell: (info: any) => {
            const dateString = info.getValue() as string;
            return formatDate(dateString);
          },
        },
        { accessor: "entry_transfer_note", header: "Entry Transfer Note" },
        { accessor: "presentation", header: "Presentation" },
        { accessor: "status", header: "Status" },
        { accessor: "type", header: "Type" },
        { accessor: "comments", header: "Comments" },
        { accessor: "documentType.name", header: "Document Type" },
        {
          accessor: "actions",
          header: "Actions",
          cell: (info: any) => {
            const entry = info.row.original;
            const encoded = encodeURIComponent(entry.entry_order_no);
            return (
              <button
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => actions(encoded)}
              >
                Click to Audit
              </button>
            );
          },
        },
      ]),
    [navigate]
  );

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
