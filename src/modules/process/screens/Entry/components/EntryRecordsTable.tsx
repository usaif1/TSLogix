/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";

// store
import { ProcessesStore } from "@/globalStore";
import { formatDate } from "@/utils/dateUtils";
import { EntryOrdersTable } from ".";
import type { EntryOrder } from "@/modules/process/types";

const EntryRecordsTable: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const entryOrders = ProcessesStore.use.entryOrders();
  // const navigate = useNavigate();

  const navigateToAudit = () => {
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
        return "bg-gray-400";
    }
  };

  const getAuditStatusText = useCallback((auditStatus: string) => {
    const statusLower = auditStatus?.toLowerCase();
    return t(`process:${statusLower}`, statusLower);
  }, [t]);

  const columns = useMemo<ColumnDef<EntryOrder, any>[]>(
    () => [
      {
        accessorKey: "entry_order_no",
        header: t('process:entry_order_no'),
        cell: ({ getValue }) => (
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigateToAudit();
            }}
          >
            {getValue() as string}
          </button>
        ),
      },
      {
        id: "actions",
        header: t('process:audit_status'),
        cell: ({ row }) => {
          const entry = row.original;
          return (
            <button
              className={`w-20 cursor-pointer border rounded-md flex justify-center items-center py-0.5 ${getBgColor(
                entry?.audit_status
              )} text-white hover:opacity-80 transition-opacity`}
            >
              <p className="text-xs font-bold">
                {getAuditStatusText(entry?.audit_status)}
              </p>
            </button>
          );
        },
      },
      {
        accessorKey: "total_palettes",
        header: t('process:palettes'),
      },
      {
        accessorKey: "total_quantity_packaging",
        header: t('process:total_qty'),
      },
      {
        accessorKey: "total_weight",
        header: t('process:total_weight'),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value ? `${value} kg` : '-';
        },
      },
      {
        accessorKey: "total_insured_value",
        header: t('process:insured_value'),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value ? `$${value.toLocaleString()}` : '-';
        },
      },
      {
        accessorKey: "entry_date",
        header: t('process:entry_date'),
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        accessorKey: "document_date",
        header: t('process:document_date'),
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        accessorKey: "admission_date_time",
        header: t('process:admission_date'),
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        accessorKey: "entry_transfer_note",
        header: t('process:entry_transfer_note'),
      },
      {
        accessorKey: "presentation",
        header: t('process:presentation'),
      },
      {
        accessorKey: "document_status",
        header: t('process:document_status'),
      },
      {
        accessorKey: "type",
        header: t('process:type'),
      },
      {
        accessorKey: "comments",
        header: t('process:comments'),
      },
      {
        accessorFn: (row) => row.documentType?.name,
        id: "documentType.name",
        header: t('process:document_type'),
      },
      {
        accessorFn: (row) => row.supplier?.name,
        id: "supplier.name",
        header: t('process:supplier'),
      },
      {
        accessorFn: (row) => row.origin?.name,
        id: "origin.name",
        header: t('process:origin'),
      },
    ],
    [t, getAuditStatusText]
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