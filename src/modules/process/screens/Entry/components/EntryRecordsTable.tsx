/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// store
import { ProcessesStore } from "@/globalStore";
import { createTableColumns } from "@/utils/tableUtils";
import { formatDate } from "@/utils/dateUtils";
import { EntryOrdersTable } from ".";

const EntryRecordsTable: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const entryOrders = ProcessesStore.use.entryOrders();
  const navigate = useNavigate();

  const actions = async (orderCode: string) => {
    console.log(orderCode)
    // navigate(`/processes/entry/audit?orderNo=${encodeURIComponent(orderCode)}`);
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
        { accessor: "entry_order_no", header: t('process:entry_order_no') },
        {
          accessor: "actions",
          header: t('process:audit_status'),
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
                <p className="text-xs font-bold">{t(`process:${entry?.audit_status.toLowerCase()}`)}</p>
              </button>
            );
          },
        },
        { accessor: "palettes", header: t('process:palettes') },
        { accessor: "total_qty", header: t('process:total_qty') },
        { accessor: "total_weight", header: t('process:total_weight') },
        { accessor: "insured_value", header: t('process:insured_value') },
        {
          accessor: "entry_date",
          header: t('process:entry_date'),
          cell: (info: any) => {
            const dateString = info.getValue() as string;
            return formatDate(dateString);
          },
        },
        { accessor: "entry_transfer_note", header: t('process:entry_transfer_note') },
        { accessor: "presentation", header: t('process:presentation') },
        { accessor: "status", header: t('process:status') },
        { accessor: "type", header: t('process:type') },
        { accessor: "comments", header: t('process:comments') },
        { accessor: "documentType.name", header: t('process:document_type') },
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  );

  return (
    <div className="max-w-full h-full">
      <EntryOrdersTable
        data={entryOrders}
        columns={columns}
        showPagination={true}
        emptyMessage={t('process:no_entry_orders')}
      />
    </div>
  );
};

export default EntryRecordsTable;
