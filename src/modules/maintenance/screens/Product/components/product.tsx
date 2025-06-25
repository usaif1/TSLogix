/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Divider } from "@/components";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { OrderBtnGroup } from "@/modules/process/components";
import { Plus } from "@phosphor-icons/react";

interface ProductRegisterProps {
  products: any[];
  searchText: string;
  setSearchText: (text: string) => void;
}

const ProductRegisterComponent: React.FC<ProductRegisterProps> = ({
  products,
  searchText,
  setSearchText,
}) => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  const columns = useMemo(
    () =>
      createTableColumns([
        { 
          accessor: "product_code", 
          header: t('product_code'),
          cell: (info) => info.getValue() || "N/A",
        },
        { 
          accessor: "name", 
          header: t('product_name'),
          cell: (info) => info.getValue() || "N/A",
        },
        { 
          accessor: "manufacturer", 
          header: t('manufacturer'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "category.name",
          header: t('category'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "subcategory1.name",
          header: t('subcategory_1'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "subcategory2.name",
          header: t('subcategory_2'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "temperature_range.range",
          header: t('temperature_range'),
          cell: (info) => {
            const range = info.getValue();
            if (range) {
              return range;
            }
            // Fallback to min/max if range name not available
            const row = info.row.original;
            const minTemp = row.temperature_range?.min_celsius;
            const maxTemp = row.temperature_range?.max_celsius;
            if (minTemp !== undefined && maxTemp !== undefined) {
              return `${minTemp}°C to ${maxTemp}°C`;
            }
            return "N/A";
          },
        },
        { 
          accessor: "humidity", 
          header: t('humidity'),
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
      ]),
    [t]
  );

  const buttonGroup = useMemo(
    () => [
      {
        title: t('add_new_product'),
        icon: Plus,
        route: "/maintenance/product/new",
      },
    ],
    [t]
  );

  return (
    <div>
      {/* Search field for product name or id */}
      <div className="w-full flex items-end gap-x-6">
        <div className="w-1/2 flex flex-col">
          <label htmlFor="searchText">{t('product_name_or_id')}</label>
          <input
            type="text"
            id="searchText"
            name="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
            placeholder={t('search_by_product_name_or_id')}
          />
        </div>
        <OrderBtnGroup items={buttonGroup} />
      </div>

      <Divider />
      <div className="w-full overflow-x-auto">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {t('products_found', { count: products.length })}
          </span>
        </div>

        {/* Container with fixed maximum height */}
        <div className="mt-2 overflow-y-auto">
          <DataTable
            data={products}
            columns={columns}
            showPagination={true}
            pageSize={10}
            emptyMessage={t('no_products_found_adjust_filters')}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductRegisterComponent;

