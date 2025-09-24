import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ProcessService } from '../../api/process.service';
import { Button, DataTable, Spinner } from '@/components';
import type { ColumnDef } from '@tanstack/react-table';

interface BulkUploadResult {
  successful_orders: Array<{
    departure_order_no: string;
    departure_order_id: string;
    products_count: number;
  }>;
  failed_orders: Array<{
    departure_order_no: string;
    error: string;
    row_number: number;
  }>;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  currentStep: string;
}

const BulkDeparture: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    currentStep: ''
  });
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error(t('only_excel_files_allowed'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('file_size_too_large'));
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      setUploadProgress(prev => ({
        ...prev,
        isUploading: true,
        currentStep: t('generating_template')
      }));

      const response = await ProcessService.downloadBulkDepartureTemplate();

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulk_departure_template_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('template_downloaded_successfully'));
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error(t('failed_to_download_template'));
    } finally {
      setUploadProgress(prev => ({ ...prev, isUploading: false, currentStep: '' }));
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error(t('please_select_file_first'));
      return;
    }

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentStep: t('validating_file')
      });

      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);

      setUploadProgress(prev => ({
        ...prev,
        currentStep: 'Processing orders...'
      }));

      const result = await ProcessService.processBulkDepartureOrders(formData);

      clearInterval(progressInterval);

      setUploadProgress({
        isUploading: false,
        progress: 100,
        currentStep: 'Completed'
      });

      if (result.success) {
        setUploadResult(result.data);
        toast.success(
          `Successfully processed ${result.data.successful_orders.length} out of ${result.data.successful_orders.length + result.data.failed_orders.length} orders`
        );
      } else {
        toast.error(result.message || 'Upload failed');
        if (result.errors && result.errors.length > 0) {
          console.error('Validation errors:', result.errors);
        }
      }

    } catch (error: any) {
      console.error('Error in bulk upload:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: ''
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress({
      isUploading: false,
      progress: 0,
      currentStep: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Table columns for successful orders
  const successColumns: ColumnDef<BulkUploadResult['successful_orders'][0]>[] = [
    {
      accessorKey: 'departure_order_no',
      header: 'Order Number',
      cell: ({ row }) => (
        <span className="font-medium text-green-700">
          {row.original.departure_order_no}
        </span>
      )
    },
    {
      accessorKey: 'departure_order_id',
      header: 'Order ID',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.departure_order_id.substring(0, 8)}...
        </span>
      )
    },
    {
      accessorKey: 'products_count',
      header: 'Products',
      cell: ({ row }) => (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          {row.original.products_count} products
        </span>
      )
    }
  ];

  // Table columns for failed orders
  const errorColumns: ColumnDef<BulkUploadResult['failed_orders'][0]>[] = [
    {
      accessorKey: 'departure_order_no',
      header: 'Order Number',
      cell: ({ row }) => (
        <span className="font-medium text-red-700">
          {row.original.departure_order_no}
        </span>
      )
    },
    {
      accessorKey: 'row_number',
      header: 'Row',
      cell: ({ row }) => (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          Row {row.original.row_number}
        </span>
      )
    },
    {
      accessorKey: 'error',
      header: 'Error',
      cell: ({ row }) => (
        <span className="text-sm text-red-600">
          {row.original.error}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t('bulk_departure_upload')}
        </h1>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            {t('bulk_upload_instructions')}
          </h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>{t('bulk_upload_step_1')}</li>
            <li>{t('bulk_upload_step_2')}</li>
            <li>{t('bulk_upload_step_3')}</li>
            <li>{t('bulk_upload_step_4')}</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="mb-6">
          <Button
            onClick={handleDownloadTemplate}
            disabled={uploadProgress.isUploading}
            additionalClass="bg-green-600 hover:bg-green-700 text-white"
          >
            {uploadProgress.isUploading && uploadProgress.currentStep.includes('template') ? (
              <Spinner />
            ) : null}
            {t('download_excel_template')}
          </Button>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploadProgress.isUploading}
                className="hidden"
              />
              <div className="text-gray-600 mb-2">
                {selectedFile ? (
                  <div>
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <span>Click to select Excel file or drag and drop</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Supported formats: .xlsx, .xls (max 10MB)
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress.isUploading}
                variant="secondary"
              >
                {selectedFile ? 'Change File' : 'Select File'}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.isUploading && (
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 text-center">
              {uploadProgress.currentStep} ({uploadProgress.progress}%)
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleBulkUpload}
            disabled={!selectedFile || uploadProgress.isUploading}
            additionalClass="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploadProgress.isUploading ? (
              <Spinner />
            ) : null}
            Upload & Process
          </Button>

          <Button
            onClick={handleReset}
            disabled={uploadProgress.isUploading}
            variant="secondary"
          >
            Reset
          </Button>
        </div>

        {/* Results */}
        {uploadResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-800">
                  {uploadResult.successful_orders.length}
                </div>
                <div className="text-green-600">Successful Orders</div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-800">
                  {uploadResult.failed_orders.length}
                </div>
                <div className="text-red-600">Failed Orders</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-800">
                  {uploadResult.successful_orders.length + uploadResult.failed_orders.length}
                </div>
                <div className="text-blue-600">Total Processed</div>
              </div>
            </div>

            {/* Successful Orders Table */}
            {uploadResult.successful_orders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Successful Orders
                </h3>
                <DataTable
                  data={uploadResult.successful_orders}
                  columns={successColumns}
                />
              </div>
            )}

            {/* Failed Orders Table */}
            {uploadResult.failed_orders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  Failed Orders
                </h3>
                <DataTable
                  data={uploadResult.failed_orders}
                  columns={errorColumns}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkDeparture;