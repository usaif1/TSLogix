import React, { useState, useCallback } from 'react';
import { X, Upload, File, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ProductService } from '@/modules/maintenance/api/maintenance.service';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUploadSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'SAFETY_SHEET', label: 'Safety Data Sheet' },
  { value: 'SPECIFICATION', label: 'Product Specification' },
  { value: 'MANUAL', label: 'User Manual' },
  { value: 'OTRO', label: 'Other' },
];

interface SelectedFile {
  file: File;
  documentType: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: SelectedFile[] = Array.from(files).map(file => ({
      file,
      documentType: 'OTRO'
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    e.target.value = ''; // Reset input
  }, []);

  const handleDocumentTypeChange = useCallback((index: number, documentType: string) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], documentType };
      return updated;
    });
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Append files
      selectedFiles.forEach(({ file }) => {
        formData.append('uploaded_documents', file);
      });

      // Append document types as JSON array
      const documentTypes = selectedFiles.map(({ documentType }) => documentType);
      formData.append('document_types', JSON.stringify(documentTypes));

      const response = await ProductService.uploadProductDocuments(productId, formData);

      if (response.data.success) {
        toast.success(response.data.message);
        onUploadSuccess();
        handleClose();
      } else {
        toast.error(response.data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, productId, onUploadSuccess]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFiles([]);
      onClose();
    }
  }, [isUploading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* File Upload Area */}
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Click to select files or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, XLS, Images (Max 10MB per file)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
              />
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Selected Files ({selectedFiles.length})
              </h3>
              {selectedFiles.map((selectedFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <File size={24} className="text-blue-600 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <select
                    value={selectedFile.documentType}
                    onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                    disabled={isUploading}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {DOCUMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No files selected</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
