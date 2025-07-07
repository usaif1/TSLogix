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
          accessor: "uploaded_documents",
          header: t('documents'),
          cell: (info) => {
            const documents = info.getValue();
            
            if (!documents) {
              return (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {t('no_documents')}
                </span>
              );
            }
            
            // Handle new format (array of document objects)
            if (Array.isArray(documents)) {
              return (
                <div className="flex flex-col space-y-1">
                  {documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(doc.public_url, '_blank')}
                        className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        title={`${doc.file_name} (${doc.document_type})`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        {doc.file_name?.length > 15 ? `${doc.file_name.substring(0, 15)}...` : doc.file_name}
                      </button>
                    </div>
                  ))}
                </div>
              );
            }
            
            // Handle old format (string filename)
            if (typeof documents === 'string') {
              const fileName = documents.split('/').pop() || documents;
              return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}
                </span>
              );
            }
            
            return "N/A";
          },
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

