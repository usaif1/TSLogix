/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel } from "react-select";
import { Divider } from "@/components";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { OrderBtnGroup } from "@/modules/process/components";
import { Plus } from "@phosphor-icons/react";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface ProductRegisterProps {
  productLineOptions: any[];
  groupOptions: any[];
  products: any[];
  selectedProductLine: any;
  setSelectedProductLine: (option: any) => void;
  selectedGroup: any;
  setSelectedGroup: (option: any) => void;
  searchText: string;
  setSearchText: (text: string) => void;
}

const ProductRegisterComponent: React.FC<ProductRegisterProps> = ({
  productLineOptions,
  groupOptions,
  products,
  selectedProductLine,
  setSelectedProductLine,
  selectedGroup,
  setSelectedGroup,
  searchText,
  setSearchText,
}) => {
  const { t } = useTranslation(['maintenance', 'common']);
  
  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "name", header: t('product_name') },
        { accessor: "manufacturer", header: t('manufacturer') },
        {
          accessor: "product_line.name",
          header: t('product_line'),
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "group.name",
          header: t('group'),
          cell: (info) => info.getValue() || "N/A",
        },
        { accessor: "humidity", header: t('humidity') },
        {
          accessor: "min_temperature",
          header: t('min_temp'),
          cell: (info) => {
            const value = info.getValue();
            return value !== undefined && value !== null ? `${value}°C` : "N/A";
          },
        },
        {
          accessor: "max_temperature",
          header: t('max_temp'),
          cell: (info) => {
            const value = info.getValue();
            return value !== undefined && value !== null ? `${value}°C` : "N/A";
          },
        },
      ]),
    [t]
  );

  const buttonGroup = useMemo(
    () => [
      {
        title: t('common:add'),
        icon: Plus,
        route: "/maintenance/product/new",
      },
    ],
    [t]
  );

  return (
    <div>
      {/* Filter section */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="product_line">{t('product_line')}</label>
          <Select
            inputId="product_line"
            name="product_line"
            className="!z-20"
            options={productLineOptions}
            styles={reactSelectStyle}
            onChange={(option) => setSelectedProductLine(option)}
            placeholder={t('select_product_line')}
            value={selectedProductLine}
            isClearable
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="group">{t('group')}</label>
          <Select
            inputId="group"
            name="group"
            options={groupOptions}
            styles={reactSelectStyle}
            onChange={(option) => setSelectedGroup(option)}
            placeholder={t('select_group')}
            value={selectedGroup}
            isClearable
          />
        </div>
      </div>

      <Divider />

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
