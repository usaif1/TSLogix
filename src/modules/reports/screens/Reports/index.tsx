import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import { ReportFilters } from '../../api/reportsService';
import Button from '@/components/Button';
import Text from '@/components/Text';
import TextInput from '@/components/TextInput';
import LoaderSync from '@/components/Loaders/LoaderSync';
import WarehouseReport from './WarehouseReport';
import ProductCategoryReport from './ProductCategoryReport';
import ProductWiseReport from './ProductWiseReport';
import CardexReport from './CardexReport';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const {
    selectedReportType,
    setSelectedReportType,
    filters,
    setFilters,
    isLoading,
    loadingStates,
    fetchWarehouseReports,
    fetchProductCategoryReports,
    fetchProductWiseReports,
    fetchCardexReports,
  } = useReportsStore();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productCode, setProductCode] = useState('');

  // Report type options
  const reportTypes = [
    { key: 'warehouse', label: t('reports:warehouse_report'), icon: '🏢' },
    { key: 'product-category', label: t('reports:product_category_report'), icon: '📊' },
    { key: 'product-wise', label: t('reports:product_wise_report'), icon: '📦' },
    { key: 'cardex', label: t('reports:cardex_report'), icon: '📋' },
  ];

  // Apply filters and fetch data
  const applyFilters = () => {
    const newFilters: ReportFilters = {};
    
    if (dateFrom) newFilters.date_from = dateFrom;
    if (dateTo) newFilters.date_to = dateTo;
    if (productCode) newFilters.product_code = productCode;

    setFilters(newFilters);

    // Fetch data based on selected report type
    switch (selectedReportType) {
      case 'warehouse':
        fetchWarehouseReports(newFilters);
        break;
      case 'product-category':
        fetchProductCategoryReports(newFilters);
        break;
      case 'product-wise':
        fetchProductWiseReports(newFilters);
        break;
      case 'cardex':
        fetchCardexReports(newFilters);
        break;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setProductCode('');
    setFilters({});
    applyFilters();
  };

  // Handle report type change
  const handleReportTypeChange = (type: 'warehouse' | 'product-category' | 'product-wise' | 'cardex') => {
    setSelectedReportType(type);
    applyFilters();
  };

  // Initial load
  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Text size="2xl" weight="font-bold" additionalClass="text-gray-900">
                {t('reports:reports')}
              </Text>
              <Text size="sm" additionalClass="text-gray-600 mt-1">
                {t('reports:reports_description')}
              </Text>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {reportTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => handleReportTypeChange(type.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  selectedReportType === type.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4">
            {t('reports:filters')}
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reports:date_from')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reports:date_to')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reports:product_code')}
              </label>
              <TextInput
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder={t('reports:enter_product_code')}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <Button
                onClick={applyFilters}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoaderSync loaderText="" />
                    <span>{t('reports:loading')}</span>
                  </div>
                ) : (
                  t('reports:apply_filters')
                )}
              </Button>
              <Button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
              >
                {t('reports:clear_filters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {loadingStates[`${selectedReportType}-reports`] ? (
            <div className="p-8 text-center">
              <LoaderSync loaderText={t('reports:loading_report')} />
            </div>
          ) : (
            <>
              {selectedReportType === 'warehouse' && <WarehouseReport />}
              {selectedReportType === 'product-category' && <ProductCategoryReport />}
              {selectedReportType === 'product-wise' && <ProductWiseReport />}
              {selectedReportType === 'cardex' && <CardexReport />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports; 