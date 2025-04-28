/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// store
import { ProcessesStore } from "@/globalStore";
import { createTableColumns } from "@/utils/tableUtils";
import { formatDate } from "@/utils/dateUtils";
import { EntryOrdersTable } from ".";

const EntryRecordsTable: React.FC = () => {
  const entryOrders = ProcessesStore.use.entryOrders();
  const navigate = useNavigate();

  const actions = async (orderCode: string) => {
    navigate(`/processes/entry/audit?orderNo=${encodeURIComponent(orderCode)}`);
  };

  const getBgColor = (auditStatus: string) => {
    switch (auditStatus) {
      case "PASSED":
        return "bg-emerald-600";

      case "PENDING":
        return "bg-sky-600";

      case "FAILED":
        return "bg-orange-400";

      default:
        break;
    }
  };

  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "entry_order_no", header: "Order" },
        {
          accessor: "actions",
          header: "Audit Status",
          cell: (info: any) => {
            const entry = info.row.original;
            const encoded = encodeURIComponent(entry.entry_order_no);
            return (
              <button
                className={`w-20 cursor-pointer border rounded-md flex justify-center items-center py-0.5 ${getBgColor(
                  entry?.audit_status
                )} text-white`}
                onClick={() => actions(encoded)}
              >
                <p className="text-xs font-bold">{entry?.audit_status}</p>
              </button>
            );
          },
        },
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
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate]
  );

  return (
    <div className="max-w-full h-full">
      <EntryOrdersTable
        data={entryOrders}
        columns={columns}
        showPagination={true}
        emptyMessage="No entry orders found"
      />
    </div>
  );
};

export default EntryRecordsTable;
