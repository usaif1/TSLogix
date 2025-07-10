import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import { ReportFilters } from '../../api/reportsService';
import { AuthStore } from '@/globalStore';
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
  const { authUser } = AuthStore();
  const {
    selectedReportType,
    setSelectedReportType,
    filters,
    setFilters,
    clearFilters: clearStoreFilters,
    isLoading,
    loadingStates,
    fetchWarehouseReports,
    fetchProductCategoryReports,
    fetchProductWiseReports,
    fetchCardexReports,
  } = useReportsStore();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');

  // Get user role from authUser or localStorage as fallback
  const userRole = authUser?.role || localStorage.getItem('role') || '';

  // Helper function to check if user is a client
  const isClient = () => {
    return userRole === 'CLIENT' || userRole === 'client';
  };

  // Report type options based on user role
  const allReportTypes = [
    { key: 'warehouse', label: t('reports:warehouse_report_title') || t('reports:warehouse_report') || 'Reporte de Almacén' },
    { key: 'product-category', label: t('reports:product_category_report_title') || t('reports:product_category_report') || 'Reporte de Categoría de Productos' },
    { key: 'product-wise', label: t('reports:product_wise_report_title') || t('reports:product_wise_report') || 'Reporte de Productos por Movimiento' },
    { key: 'cardex', label: t('reports:cardex_report_title') || t('reports:cardex_report') || 'Reporte Cardex' },
  ];

  // Filter reports based on user role
  const reportTypes = isClient() 
    ? allReportTypes.filter(report => report.key === 'cardex' || report.key === 'product-wise')
    : allReportTypes;

  // Apply filters and fetch data
  const applyFilters = () => {
    const newFilters: ReportFilters = {};
    
    if (dateFrom) newFilters.date_from = dateFrom;
    if (dateTo) newFilters.date_to = dateTo;
    if (customerName) newFilters.customer_name = customerName;
    if (customerCode) newFilters.customer_code = customerCode;
    if (productName) newFilters.product_name = productName;
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
    // Clear local state
    setDateFrom('');
    setDateTo('');
    setCustomerName('');
    setCustomerCode('');
    setProductName('');
    setProductCode('');
    
    // Clear store filters
    clearStoreFilters();
    
    // Fetch data with empty filters
    const emptyFilters = {};
    switch (selectedReportType) {
      case 'warehouse':
        fetchWarehouseReports(emptyFilters);
        break;
      case 'product-category':
        fetchProductCategoryReports(emptyFilters);
        break;
      case 'product-wise':
        fetchProductWiseReports(emptyFilters);
        break;
      case 'cardex':
        fetchCardexReports(emptyFilters);
        break;
    }
  };

  // Handle report type change
  const handleReportTypeChange = (type: 'warehouse' | 'product-category' | 'product-wise' | 'cardex') => {
    setSelectedReportType(type);
    // Clear previous data when switching report types
    switch (type) {
      case 'product-category':
        fetchProductCategoryReports(filters);
        break;
      case 'product-wise':
        fetchProductWiseReports(filters);
        break;
      case 'warehouse':
        fetchWarehouseReports(filters);
        break;
      case 'cardex':
        fetchCardexReports(filters);
        break;
    }
  };

  // Initialize with current month dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const defaultDateFrom = firstDay.toISOString().split('T')[0];
    const defaultDateTo = lastDay.toISOString().split('T')[0];
    
    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);
    
    // Apply initial filters with default dates
    const initialFilters: ReportFilters = {
      date_from: defaultDateFrom,
      date_to: defaultDateTo
    };
    setFilters(initialFilters);
    
    // Load initial data based on selected report type
    setTimeout(() => {
      switch (selectedReportType) {
        case 'warehouse':
          fetchWarehouseReports(initialFilters);
          break;
        case 'product-category':
          fetchProductCategoryReports(initialFilters);
          break;
        case 'product-wise':
          fetchProductWiseReports(initialFilters);
          break;
        case 'cardex':
          fetchCardexReports(initialFilters);
          break;
      }
    }, 100); // Small delay to ensure state is updated
  }, []);

  // Handle role-based default report selection
  useEffect(() => {
    if (isClient() && (selectedReportType === 'warehouse' || selectedReportType === 'product-category')) {
      // If client tries to access restricted reports, redirect to cardex
      setSelectedReportType('cardex');
    }
  }, [userRole, selectedReportType]);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
                {t('reports:reports') || 'Reportes'}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:reports_description') || 'Gestión y generación de reportes del sistema'}
              </Text>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {reportTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => handleReportTypeChange(type.key as any)}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  selectedReportType === type.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <Text size="sm" weight="font-semibold" additionalClass="mb-2">
            {t('reports:filters') || 'Filtros'}
          </Text>
          
          {/* First Row - Date and Basic Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:from_date') || 'Fecha Desde'}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:to_date') || 'Fecha Hasta'}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

          </div>

          {/* Second Row - Customer and Product Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:customer_name') || 'Nombre del Cliente'}
              </label>
              <TextInput
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('reports:enter_customer_name') || 'Ingrese nombre del cliente'}
                className="w-full text-sm"
              />
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:customer_code') || 'Código del Cliente'}
              </label>
              <TextInput
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder={t('reports:enter_customer_code') || 'Ingrese código del cliente'}
                className="w-full text-sm"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:product_name') || 'Nombre del Producto'}
              </label>
              <TextInput
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t('reports:enter_product_name') || 'Ingrese nombre del producto'}
                className="w-full text-sm"
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('reports:product_code') || 'Código del Producto'}
              </label>
              <TextInput
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder={t('reports:enter_product_code') || 'Ingrese código del producto'}
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs"
            >
              {t('reports:clear_filters') || 'Limpiar Filtros'}
            </Button>
            <Button
              onClick={applyFilters}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <LoaderSync loaderText="" />
                  <span>{t('reports:loading') || 'Cargando...'}</span>
                </div>
              ) : (
                t('reports:apply_filters') || 'Aplicar Filtros'
              )}
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm" style={{ minHeight: '75vh' }}>
          {loadingStates[`${selectedReportType}-reports`] ? (
            <div className="p-4 text-center">
              <LoaderSync loaderText={t('reports:loading_report') || 'Cargando reporte...'} />
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