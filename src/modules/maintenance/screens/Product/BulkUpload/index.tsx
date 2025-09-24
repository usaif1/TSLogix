import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  FileXls,
  ArrowLeft,
  CheckCircle,
  XCircle,
  WarningCircle,
  Spinner
} from '@phosphor-icons/react';
import { Text, Divider } from '@/components';

interface BulkUploadResult {
  success: boolean;
  message: string;
  data?: {
    successCount: number;
    errorCount: number;
    errors: Array<{
      row: number;
      product_code: string;
      error: string;
    }>;
  };
}

const BulkProductUpload: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      toast.error('Please select a valid Excel file (.xlsx)');
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  // Download template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      // TODO: Implement template download API call
      const response = await fetch('/api/product/bulk-template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_bulk_upload_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  }, []);

  // Handle bulk upload
  const handleBulkUpload = useCallback(async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // TODO: Implement bulk upload API call
      const response = await fetch('/api/product/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload products');
      setUploadResult({
        success: false,
        message: 'Failed to upload products'
      });
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/maintenance/product')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('common:back')}</span>
        </button>
        <Text size="3xl" weight="font-bold">
          {t('bulk_upload_products')}
        </Text>
      </div>

      <Divider />

      <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {t('bulk_upload_instructions')}
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>{t('download_template_instruction')}</li>
            <li>{t('fill_template_instruction')}</li>
            <li>{t('upload_file_instruction')}</li>
          </ol>
        </div>

        {/* Download Template Section */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('step_1_download_template')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('template_description')}
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download size={20} className="mr-2" />
            {t('download_excel_template')}
          </button>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('step_2_upload_file')}
          </h3>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileXls size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {t('drag_drop_file')}
            </p>
            <p className="text-gray-500 mb-4">{t('or')}</p>

            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              <Upload size={20} className="mr-2" />
              {t('select_file')}
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <div className="mt-6">
              <button
                onClick={handleBulkUpload}
                disabled={isUploading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Spinner size={20} className="mr-2 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mr-2" />
                    {t('upload_products')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {uploadResult && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('upload_results')}
            </h3>

            <div className={`p-4 rounded-lg ${
              uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {uploadResult.success ? (
                  <CheckCircle size={24} className="text-green-600 mr-2" />
                ) : (
                  <XCircle size={24} className="text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.message}
                </span>
              </div>

              {uploadResult.data && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center">
                        <CheckCircle size={20} className="text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">
                            {t('successful_products')}
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {uploadResult.data.successCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center">
                        <XCircle size={20} className="text-red-600 mr-2" />
                        <div>
                          <p className="font-medium text-red-800">
                            {t('failed_products')}
                          </p>
                          <p className="text-2xl font-bold text-red-900">
                            {uploadResult.data.errorCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Details */}
                  {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                    <div className="bg-white rounded border">
                      <div className="p-4 border-b">
                        <h4 className="font-medium text-red-800 flex items-center">
                          <WarningCircle size={20} className="mr-2" />
                          {t('error_details')}
                        </h4>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {uploadResult.data.errors.map((error, index) => (
                          <div key={index} className="p-3 border-b last:border-b-0">
                            <p className="font-medium text-sm">
                              {t('row')} {error.row}: {error.product_code}
                            </p>
                            <p className="text-red-600 text-sm">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkProductUpload;