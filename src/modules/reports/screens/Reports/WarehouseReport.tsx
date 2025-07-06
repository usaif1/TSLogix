import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';

const WarehouseReport: React.FC = () => {
  const { t } = useTranslation();
  const { warehouseReports, exportReport, loadingStates, fetchWarehouseReports, filters, setFilters } = useReportsStore();

  // Local state for date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Initialize with current month dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const defaultDateFrom = firstDay.toISOString().split('T')[0];
    const defaultDateTo = lastDay.toISOString().split('T')[0];
    
    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);
    
    // Set initial filters
    setFilters({
      date_from: defaultDateFrom,
      date_to: defaultDateTo,
    });
  }, [setFilters]);

  // Fetch data when filters change
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchWarehouseReports({
        date_from: dateFrom,
        date_to: dateTo,
      });
    }
  }, [dateFrom, dateTo, fetchWarehouseReports]);

  const handleDateFilterChange = () => {
    if (dateFrom && dateTo) {
      setFilters({
        date_from: dateFrom,
        date_to: dateTo,
      });
      fetchWarehouseReports({
        date_from: dateFrom,
        date_to: dateTo,
      });
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      await exportReport('warehouse', format);
    } catch (error) {
      console.error('Error exporting warehouse report:', error);
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  // Helper function to safely format currency
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '$0';
    return `$${value.toLocaleString()}`;
  };

  // Helper function to safely format weight
  const formatWeight = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0.00 kg';
    return `${value.toFixed(2)} kg`;
  };

  // Helper function to safely format volume
  const formatVolume = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0.00 m³';
    return `${value.toFixed(2)} m³`;
  };

  // Get summary data safely
  const summary = warehouseReports?.summary;
  const inventoryData = warehouseReports?.data || [];

  // Calculate warehouse statistics
  const uniqueWarehouses = new Set(inventoryData.map(item => item.warehouse_id)).size;
  const uniqueProducts = new Set(inventoryData.map(item => item.product_id)).size;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text size="xl" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:warehouse_report')}
          </Text>
          <Text size="sm" additionalClass="text-gray-600 mt-1">
            {t('reports:warehouse_report_description')}
          </Text>
        </div>
        
        {/* Export Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleExport('excel')}
            disabled={loadingStates['export-report']}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
          >
            {t('reports:export_excel')}
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={loadingStates['export-report']}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          >
            {t('reports:export_pdf')}
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <Text size="lg" weight="font-semibold" additionalClass="text-gray-900 mb-4">
          Date Range Filter
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <TextInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <TextInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleDateFilterChange}
              disabled={loadingStates['warehouse-reports']}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {loadingStates['warehouse-reports'] ? 'Loading...' : 'Apply Filter'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-blue-600 mb-1">
            {t('reports:total_warehouses')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-blue-900">
            {uniqueWarehouses}
          </Text>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-green-600 mb-1">
            {t('reports:total_products')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-green-900">
            {formatNumber(uniqueProducts)}
          </Text>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-yellow-600 mb-1">
            {t('reports:total_quantity')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-yellow-900">
            {formatNumber(summary?.total_quantity)}
          </Text>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-purple-600 mb-1">
            {t('reports:total_weight')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-purple-900">
            {formatWeight(summary?.total_weight)}
          </Text>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-orange-600 mb-1">
            Total Volume
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-orange-900">
            {formatVolume(summary?.total_volume)}
          </Text>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-red-600 mb-1">
            Expired Items
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-red-900">
            {formatNumber(summary?.urgency_breakdown?.expired)}
          </Text>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-yellow-600 mb-1">
            Urgent Items
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-yellow-900">
            {formatNumber(summary?.urgency_breakdown?.urgent)}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['warehouse-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            Loading warehouse report data...
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['warehouse-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!inventoryData || inventoryData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('reports:no_data_available')}
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((item) => (
                    <tr key={item.allocation_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900">
                            {item.product_name || 'N/A'}
                          </Text>
                          <Text size="sm" additionalClass="text-gray-500">
                            {item.product_code}
                          </Text>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900">
                            {item.warehouse_name || 'N/A'}
                          </Text>
                          <Text size="sm" additionalClass="text-gray-500">
                            {item.warehouse_location}
                          </Text>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.position || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(item.quantity_units)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatWeight(item.weight_kg)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_expired ? 'bg-red-100 text-red-800' :
                          item.is_urgent ? 'bg-yellow-100 text-yellow-800' :
                          item.is_near_expiry ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.is_expired ? 'Expired' :
                           item.is_urgent ? 'Urgent' :
                           item.is_near_expiry ? 'Near Expiry' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.days_to_expiry > 0 ? `${item.days_to_expiry} days` : `${Math.abs(item.days_to_expiry)} days ago`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Metadata */}
      {warehouseReports && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text size="sm" additionalClass="text-gray-600">
            Report generated at: {new Date(warehouseReports.report_generated_at).toLocaleString()}
          </Text>
          <Text size="sm" additionalClass="text-gray-600 mt-1">
            Processing time: {warehouseReports.processing_time_ms}ms
          </Text>
        </div>
      )}
    </div>
  );
};

export default WarehouseReport; 