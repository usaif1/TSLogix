/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const navigateToAudit = useCallback((orderCode: string) => {
    navigate(`/processes/entry/audit?orderNo=${encodeURIComponent(orderCode)}`);
  }, [navigate]);

  // ✅ Updated to use review_status instead of audit_status
  const getBgColor = (reviewStatus: string) => {
    switch (reviewStatus) {
      case "APPROVED":
        return "bg-emerald-600";
      case "PENDING":
        return "bg-sky-600";
      case "REJECTED":
        return "bg-red-600";
      case "NEEDS_REVISION":
        return "bg-orange-400";
      default:
        return "bg-gray-400";
    }
  };

  const getReviewStatusText = useCallback((reviewStatus: string) => {
    const statusLower = reviewStatus?.toLowerCase();
    // ✅ Add fallback for missing translations
    return t(`process:${statusLower}`, statusLower || 'Unknown');
  }, [t]);

  // ✅ Helper function to get main supplier from products
  const getMainSupplier = useCallback((products: any[]) => {
    if (!products || products.length === 0) return "-";
    
    const suppliers = [...new Set(products.map(p => p.supplier?.name).filter(Boolean))];
    
    if (suppliers.length === 1) {
      return suppliers[0];
    } else if (suppliers.length > 1) {
      return t('process:multiple_suppliers', `Multiple (${suppliers.length})`);
    } else {
      return "-";
    }
  }, [t]);

  // ✅ Helper function to get main presentation from products
  const getMainPresentation = useCallback((products: any[]) => {
    if (!products || products.length === 0) return "-";
    
    const presentations = [...new Set(products.map(p => p.presentation).filter(Boolean))];
    
    if (presentations.length === 1) {
      return presentations[0];
    } else if (presentations.length > 1) {
      return t('process:mixed_presentations', `Mixed (${presentations.length})`);
    } else {
      return "-";
    }
  }, [t]);

  const columns = useMemo<ColumnDef<EntryOrder, any>[]>(
    () => [
      {
        accessorKey: "entry_order_no",
        header: t('process:entry_order_no'),
        size: 150,
        cell: ({ getValue }) => (
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigateToAudit(getValue() as string);
            }}
          >
            {getValue() as string}
          </button>
        ),
      },
      {
        id: "review_status",
        header: t('process:review_status'),
        size: 120,
        cell: ({ row }) => {
          const entry = row.original;
          return (
            <button
              className={`min-w-20 cursor-pointer border rounded-md flex justify-center items-center py-0.5 px-2 ${getBgColor(
                entry?.review_status
              )} text-white hover:opacity-80 transition-opacity`}
            >
              <p className="text-xs font-bold">
                {getReviewStatusText(entry?.review_status)}
              </p>
            </button>
          );
        },
      },
      {
        // ✅ Updated to use new field name
        accessorKey: "total_pallets",
        header: t('process:palettes'),
        size: 80,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value || 0;
        },
      },
      {
        // ✅ Calculate total quantity from products
        accessorFn: (row) => {
          if (!row.products || row.products.length === 0) return 0;
          return row.products.reduce((total: number, product: any) => total + (product.inventory_quantity || 0), 0);
        },
        id: "total_quantity",
        header: t('process:total_qty'),
        size: 100,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value || 0;
        },
      },
      {
        // ✅ Use total_weight field from API
        accessorKey: "total_weight",
        header: t('process:total_weight'),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue() as string | number;
          return value ? `${value} kg` : '-';
        },
      },
      {
        // ✅ Use cif_value field from API
        accessorKey: "cif_value",
        header: t('process:insured_value'),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue() as string | number;
          return value ? `$${Number(value).toLocaleString()}` : '-';
        },
      },
      {
        // ✅ Updated to use entry_date_time
        accessorKey: "entry_date_time",
        header: t('process:entry_date'),
        size: 120,
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        accessorKey: "document_date",
        header: t('process:document_date'),
        size: 120,
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        // ✅ Updated to use registration_date instead of admission_date_time
        accessorKey: "registration_date",
        header: t('process:registration_date'),
        size: 140,
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          return formatDate(dateString);
        },
      },
      {
        // ✅ Updated to use observation instead of entry_transfer_note
        accessorKey: "observation",
        header: t('process:observation'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div className="truncate max-w-[150px]" title={value}>
              {value || '-'}
            </div>
          );
        },
      },
      {
        // ✅ Updated to extract presentation from products
        accessorFn: (row) => getMainPresentation(row.products),
        id: "presentation",
        header: t('process:presentation'),
        size: 100,
      },
      {
        // ✅ Updated to use order_status
        accessorKey: "order_status",
        header: t('process:order_status'),
        size: 120,
      },
      {
        // ✅ Updated to use review_comments
        accessorKey: "review_comments",
        header: t('process:review_comments'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div className="truncate max-w-[150px]" title={value}>
              {value || '-'}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.documentType?.name,
        id: "documentType.name",
        header: t('process:document_type'),
        size: 140,
      },
      {
        // ✅ Updated to extract supplier from products
        accessorFn: (row) => getMainSupplier(row.products),
        id: "supplier_name",
        header: t('process:supplier'),
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div className="truncate max-w-[180px]" title={value}>
              {value}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.origin?.name,
        id: "origin.name",
        header: t('process:origin'),
        size: 120,
      },
      {
        // ✅ Use creator information from API
        accessorFn: (row) => {
          if (!row.creator) return '-';
          return `${row.creator.first_name} ${row.creator.last_name}`.trim();
        },
        id: "created_by",
        header: t('process:created_by'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div className="truncate max-w-[150px]" title={value}>
              {value}
            </div>
          );
        },
      },
      {
        // ✅ Use reviewer information from API
        accessorFn: (row) => {
          if (!row.reviewer) return t('process:not_reviewed', 'Not reviewed');
          return `${row.reviewer.first_name} ${row.reviewer.last_name}`.trim();
        },
        id: "reviewed_by",
        header: t('process:reviewed_by'),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div className="truncate max-w-[150px]" title={value}>
              {value}
            </div>
          );
        },
      },
    ],
    [t, getReviewStatusText, navigateToAudit, getMainSupplier, getMainPresentation]
  );

  return (
    <div className="w-full h-full">
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