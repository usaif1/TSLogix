import React, { useState, useCallback, useMemo } from 'react';
import {
  Download,
  FileText,
  Table,
  Eye,
  Package,
  Truck
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { MasterReportItem, MasterReportSummary, MasterReportFilters } from '@/types';
import masterReportService from '@/utils/api/masterReportService';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MasterReportProps {
  data: MasterReportItem[];
  summary: MasterReportSummary;
  filters: MasterReportFilters;
  isLoading: boolean;
}

const MasterReport: React.FC<MasterReportProps> = ({
  data,
  summary,
  filters,
  isLoading
}) => {
  const { t } = useTranslation(['reports', 'common']);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Toggle row expansion
  const toggleRowExpansion = useCallback((index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Export functions
  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await masterReportService.exportMasterReportToExcel(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TSLogix_Master_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('export_successful'));
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || t('export_failed'));
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await masterReportService.exportMasterReportToPDF(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TSLogix_Master_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('export_successful'));
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || t('export_failed'));
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  // Format currency
  const formatCurrency = useCallback((amount: string | number, currency = 'USD') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    // Validate currency code - must be 3 letter ISO 4217 code, default to USD
    const validCurrency = currency && currency.length === 3 ? currency : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 2
    }).format(num);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Table size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_data_available')}</h3>
        <p className="text-gray-500">{t('try_adjusting_filters')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{t('total_transactions')}</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.total_transactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Truck className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{t('dispatched')}</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.dispatched_transactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{t('in_stock')}</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.in_stock_transactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            {isExporting ? t('generating_report') : t('export_excel')}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <FileText size={16} className="mr-2" />
            {isExporting ? t('generating_report') : t('export_pdf')}
          </button>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispatch Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Table size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('no_data_available')}
                      </h3>
                      <p className="text-gray-500">
                        {t('try_adjusting_filters')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index;
                  const isExpanded = expandedRows.has(actualIndex);

                  return (
                    <React.Fragment key={actualIndex}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {item.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.customer_code}
                          </div>
                          <div className="text-sm font-medium text-blue-600 mt-1">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product_code}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {item.entry_order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.entry_order_date}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.entry_order_supplier_name}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {item.dispatch_order_number || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.dispatch_order_date || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.order_dispatcher_from_tsl || 'N/A'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            Entry: {item.entry_order_quantity} units
                          </div>
                          <div className="text-sm text-gray-900">
                            Dispatch: {item.dispatch_order_quantity} units
                          </div>
                          <div className="text-sm text-gray-500">
                            Packages: {item.entry_order_packages}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            Entry: ${item.entry_order_total_cost}
                          </div>
                          <div className="text-sm text-gray-900">
                            Dispatch: ${item.dispatch_order_total_cost}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-gray-900">
                            {t('position_pallet')}: {item.position_pallet || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.packing_condition}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(actualIndex)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">{t('entry_order_details')}</h4>
                              <p><span className="font-medium">{t('entry_order_guide_number')}:</span> {item.entry_order_guide_number || 'N/A'}</p>
                              <p><span className="font-medium">{t('entry_order_packages')}:</span> {item.entry_order_packages}</p>
                              <p><span className="font-medium">{t('entry_order_weight')}:</span> {item.entry_order_weight} kg</p>
                              <p><span className="font-medium">{t('entry_order_unit_cost')}:</span> ${item.entry_order_unit_cost}</p>
                              <p><span className="font-medium">{t('order_receiver_from_tsl')}:</span> {item.order_receiver_from_tsl}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">{t('dispatch_details')}</h4>
                              <p><span className="font-medium">{t('dispatch_document_number')}:</span> {item.dispatch_document_number || 'N/A'}</p>
                              <p><span className="font-medium">{t('dispatch_order_packages')}:</span> {item.dispatch_order_packages || 0}</p>
                              <p><span className="font-medium">{t('dispatch_order_weight')}:</span> {item.dispatch_order_weight || 0} kg</p>
                              <p><span className="font-medium">{t('dispatch_order_unit_cost')}:</span> ${item.dispatch_order_unit_cost || '0.00'}</p>
                              <p><span className="font-medium">{t('order_out_customer_name')}:</span> {item.order_out_customer_name || 'N/A'}</p>
                              <p><span className="font-medium">{t('order_dispatcher_from_tsl')}:</span> {item.order_dispatcher_from_tsl || 'N/A'}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">{t('additional_information')}</h4>
                              <p><span className="font-medium">{t('lot_number')}:</span> {item.lot_number || 'N/A'}</p>
                              <p><span className="font-medium">{t('expiry_date')}:</span> {item.expiry_date || 'N/A'}</p>
                              <p><span className="font-medium">{t('manufacturing_date')}:</span> {item.manufacturing_date || 'N/A'}</p>
                              <p><span className="font-medium">{t('position_pallet')}:</span> {item.position_pallet || 'N/A'}</p>
                              <p><span className="font-medium">{t('packing_condition')}:</span> {item.packing_condition}</p>
                            </div>

                            {item.remarks && (
                              <div className="col-span-full">
                                <h4 className="font-medium text-gray-900 mb-2">{t('remarks')}</h4>
                                <p>{item.remarks}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Unique Products</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.unique_products}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Customers</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.unique_customers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Suppliers</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.unique_suppliers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Entry Value</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.total_entry_value)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterReport;