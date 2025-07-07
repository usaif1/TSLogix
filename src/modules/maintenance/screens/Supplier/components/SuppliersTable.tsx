/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, Divider } from "@/components";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { OrderBtnGroup } from "@/modules/process/components";
import { Plus } from "@phosphor-icons/react";

// Services and Store
import { SupplierService } from "@/modules/maintenance/api/maintenance.service";
import { MaintenanceStore } from "@/globalStore";

const SuppliersTable: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  // Store state
  const { suppliers, loaders } = MaintenanceStore();
  
  // Local state
  const [searchText, setSearchText] = useState("");

  // Load initial data
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Load suppliers based on search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadSuppliers();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchText]);

  const loadSuppliers = async () => {
    try {
      await SupplierService.fetchAllSuppliers(searchText);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error(t('failed_to_load_suppliers'));
    }
  };

  // Columns for suppliers table
  const columns = useMemo(
    () =>
      createTableColumns([
        {
          accessor: "name",
          header: t('supplier_name'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "company_name",
          header: t('company_name'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "ruc",
          header: t('ruc'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "email",
          header: t('email'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "phone",
          header: t('phone'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "country.name",
          header: t('country'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "created_at",
          header: t('common:created_at'),
          cell: (info) => {
            const date = info.getValue();
            return date ? new Date(date).toLocaleDateString() : "N/A";
          },
        },
        {
          accessor: "actions",
          header: t('actions'),
          cell: (info) => {
            const supplier = info.row.original;
            
            return (
              <div className="flex space-x-2">
                <Button
                  variant="action"
                  onClick={() => console.log("Edit supplier", supplier.supplier_id)}
                  additionalClass="text-xs px-2 py-1"
                >
                  {t('edit')}
                </Button>
                <Button
                  variant="cancel"
                  onClick={() => console.log("Delete supplier", supplier.supplier_id)}
                  additionalClass="text-xs px-2 py-1"
                >
                  {t('delete')}
                </Button>
              </div>
            );
          },
        },
      ]),
    [t]
  );

  const buttonGroup = useMemo(
    () => [
      {
        title: t('new_supplier'),
        icon: Plus,
        route: "/maintenance/supplier/new",
      },
    ],
    [t]
  );

  const isLoading = loaders["suppliers/fetch-suppliers"];

  return (
    <div>
      {/* Search field for supplier name or company */}
      <div className="w-full flex items-end gap-x-6">
        <div className="w-1/2 flex flex-col">
          <input
            type="text"
            id="searchText"
            name="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
            placeholder={t('search_by_name_or_company')}
          />
        </div>
        <OrderBtnGroup items={buttonGroup} />
      </div>

      <Divider />

      <div className="w-full overflow-x-auto">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {t('suppliers_found', { count: suppliers.length })}
          </span>
        </div>

        {/* Container with loading state */}
        <div className="mt-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <Text additionalClass="ml-3">{t('common:loading')}</Text>
            </div>
          ) : (
            <DataTable
              data={suppliers}
              columns={columns}
              showPagination={true}
              pageSize={10}
              emptyMessage={t('no_suppliers_found')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliersTable;
