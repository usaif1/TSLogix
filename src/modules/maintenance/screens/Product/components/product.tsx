/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Divider } from "@/components";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";
import { OrderBtnGroup } from "@/modules/process/components";
import { Plus, Upload } from "@phosphor-icons/react";
import { ProductService } from "@/modules/maintenance/api/maintenance.service";

interface ProductRegisterProps {
  products: any[];
  searchText: string;
  setSearchText: (text: string) => void;
  onRefresh?: () => void;
}

const ProductRegisterComponent: React.FC<ProductRegisterProps> = ({
  products,
  searchText,
  setSearchText,
  onRefresh,
}) => {
  const { t } = useTranslation(['maintenance', 'common']);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingProducts, setUploadingProducts] = useState<Set<string>>(new Set());

  const handleFileSelect = useCallback(async (productId: string, productName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('uploaded_documents', file);
    });

    // Set uploading state
    setUploadingProducts(prev => new Set(prev).add(productId));

    try {
      toast.loading(`Uploading ${files.length} document(s)...`, { id: `upload-${productId}` });

      const response = await ProductService.uploadProductDocuments(productId, formData);

      if (response.data.success) {
        toast.success(response.data.message, { id: `upload-${productId}` });
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(response.data.error || 'Upload failed', { id: `upload-${productId}` });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload documents', { id: `upload-${productId}` });
    } finally {
      // Remove uploading state
      setUploadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }

    // Reset the file input
    event.target.value = '';
  }, [onRefresh]);
  
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
            const product = info.row.original;
            const productId = product.product_id;
            const productName = product.name;
            const isUploading = uploadingProducts.has(productId);

            // No documents - show upload button
            if (!documents || (Array.isArray(documents) && documents.length === 0)) {
              return (
                <label
                  htmlFor={`file-upload-${productId}`}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    isUploading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                  } text-white`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('uploading')}
                    </>
                  ) : (
                    <>
                      <Upload size={14} className="mr-1" />
                      {t('upload_document')}
                    </>
                  )}
                  <input
                    id={`file-upload-${productId}`}
                    type="file"
                    multiple
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => handleFileSelect(productId, productName, e)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                    ref={(el) => {
                      if (el) fileInputRefs.current[productId] = el;
                    }}
                  />
                </label>
              );
            }

            // Handle new format (array of document objects)
            if (Array.isArray(documents)) {
              return (
                <div className="flex flex-col space-y-1">
                  {documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.public_url, '_blank');
                        }}
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
    [t, handleFileSelect, fileInputRefs, uploadingProducts]
  );

  const buttonGroup = useMemo(
    () => [
      {
        title: t('add_new_product'),
        icon: Plus,
        route: "/maintenance/product/new",
      },
      {
        title: t('bulk_upload_products'),
        icon: Upload,
        route: "/maintenance/product/bulk-upload",
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

