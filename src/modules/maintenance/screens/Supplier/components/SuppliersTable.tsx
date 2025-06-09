import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

// store
import { MaintenanceStore } from "@/globalStore";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const EntryRecordsTable: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const suppliers = MaintenanceStore.use.suppliers();

  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "name", header: t('supplier_name') },
        { accessor: "email", header: t('supplier_email') },
        { accessor: "phone", header: t('supplier_phone') },
        { accessor: "address", header: t('address') },
        { accessor: "city", header: t('city') },
        {
          accessor: "country",
          header: t('country'),
          cell: ({ row }) => row.original.country?.name || "", 
        },
        { accessor: "ruc", header: t('ruc') },
      ]),
    [t]
  );

  return (
    <div className="max-w-full h-full">
      <DataTable
        data={suppliers}
        columns={columns}
        showPagination={true}
        emptyMessage={t('no_suppliers_found')}
      />
    </div>
  );
};

export default EntryRecordsTable;
