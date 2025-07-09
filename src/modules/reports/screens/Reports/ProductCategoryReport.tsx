import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const ProductCategoryReport: React.FC = () => {
  const { t } = useTranslation();
  const { productCategoryReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!reportData || reportData.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers
      const headers = [
        t('reports:client_name') || 'Cliente',
        t('reports:product_code') || 'Código de Producto',
        t('reports:product_name') || 'Nombre del Producto', 
        t('reports:manufacturer') || 'Fabricante',
        t('reports:category') || 'Categoría',
        t('reports:subcategory') || 'Subcategoría',
        t('reports:approved') || 'Aprobados',
        t('reports:quarantine') || 'Cuarentena',
        t('reports:samples') || 'Contramuestras',
        t('reports:returns') || 'Devoluciones',
        t('reports:rejected') || 'Rechazados',
        t('reports:total_quantity') || 'Cantidad Total'
      ];

      // Prepare data
      const rows = reportData.map(item => [
        item.client_name,
        item.product_code,
        item.product_name,
        item.manufacturer,
        item.category,
        [item.subcategory1, item.subcategory2].filter(Boolean).join(' > '),
        item.approved_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0),
        item.quarantine_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0),
        item.sample_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0),
        item.return_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0),
        item.rejected_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0),
        getTotalQuantity(item)
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_products') || 'Total de Productos', value: formatNumber(summary?.total_products) },
        { label: t('reports:approved_items') || 'Productos Aprobados', value: formatNumber(summary?.total_approved) },
        { label: t('reports:quarantine_items') || 'Productos en Cuarentena', value: formatNumber(summary?.total_quarantine) },
        { label: t('reports:sample_items') || 'Contramuestras', value: formatNumber(summary?.total_samples) },
        { label: t('reports:return_items') || 'Devoluciones', value: formatNumber(summary?.total_returns) },
        { label: t('reports:rejected_items') || 'Productos Rechazados', value: formatNumber(summary?.total_rejected) }
      ];

      // Prepare metadata
      const metadata = productCategoryReports ? {
        generatedAt: new Date(productCategoryReports.report_generated_at).toLocaleString(),
        filters: productCategoryReports.filters_applied,
        userRole: productCategoryReports.user_role
      } : undefined;

      const exportData = convertArrayToExportData(
        t('reports:product_category_report_title') || 'Reporte de Categoría de Productos',
        headers,
        rows,
        summaryData,
        metadata
      );

      if (format === 'excel') {
        exportToExcel(exportData);
      } else {
        exportToPDF(exportData);
      }
    } catch (error) {
      console.error('Error exporting product category report:', error);
      alert(t('reports:export_failed') || 'Error en la exportación');
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };


  // Get data safely
  const summary = productCategoryReports?.summary;
  const reportData = productCategoryReports?.data || [];

  // Helper function to get total quantity for a product across all quality statuses
  const getTotalQuantity = (product: any) => {
    return (
      product.approved_products.reduce((sum: number, item: any) => sum + item.quantity_units, 0) +
      product.sample_products.reduce((sum: number, item: any) => sum + item.quantity_units, 0) +
      product.quarantine_products.reduce((sum: number, item: any) => sum + item.quantity_units, 0) +
      product.return_products.reduce((sum: number, item: any) => sum + item.quantity_units, 0) +
      product.rejected_products.reduce((sum: number, item: any) => sum + item.quantity_units, 0)
    );
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:product_category_report') || 'Reporte de Categoría de Productos'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:product_category_description') || 'Reporte de categorización de productos por estado de calidad'}
          </Text>
        </div>
        
        {/* Export Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleExport('excel')}
            disabled={loadingStates['export-report']}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs"
          >
            {t('reports:export_excel') || 'Exportar a Excel'}
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={loadingStates['export-report']}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs"
          >
            {t('reports:export_pdf') || 'Exportar a PDF'}
          </Button>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_products') || 'Total de Productos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {formatNumber(summary?.total_products)}
          </Text>
        </div>
        
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:approved_items') || 'Aprobados'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {formatNumber(summary?.total_approved)}
          </Text>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <Text size="xs" additionalClass="text-yellow-600 mb-1">
            {t('reports:quarantine_items') || 'Cuarentena'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-yellow-900">
            {formatNumber(summary?.total_quarantine)}
          </Text>
        </div>
        
        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:sample_items') || 'Muestras'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {formatNumber(summary?.total_samples)}
          </Text>
        </div>
        
        <div className="bg-orange-50 p-2 rounded border border-orange-200">
          <Text size="xs" additionalClass="text-orange-600 mb-1">
            {t('reports:return_items') || 'Devoluc.'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-orange-900">
            {formatNumber(summary?.total_returns)}
          </Text>
        </div>
        
        <div className="bg-red-50 p-2 rounded border border-red-200">
          <Text size="xs" additionalClass="text-red-600 mb-1">
            {t('reports:rejected_items') || 'Rechazados'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-red-900">
            {formatNumber(summary?.total_rejected)}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['product-category-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_product_category') || 'Cargando datos del reporte de categoría de productos...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['product-category-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '65vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '75vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:client_name') || 'Cliente'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product_code') || 'Código'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product_name') || 'Producto'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:category') || 'Categoría'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:approved') || 'Aprobados'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:quarantine') || 'Cuarentena'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:samples') || 'Contramuestras'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:returns') || 'Devoluciones'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:rejected') || 'Rechazados'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:total_quantity') || 'Cantidad Total'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!reportData || reportData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, index) => (
                    <tr key={`${item.product_code}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.client_name || 'N/A'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.product_code || 'N/A'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.product_name || 'N/A'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.manufacturer}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {item.category || 'N/A'}
                          </Text>
                          {item.subcategory1 && (
                            <Text size="xs" additionalClass="text-gray-500">
                              {item.subcategory1}
                            </Text>
                          )}
                          {item.subcategory2 && (
                            <Text size="xs" additionalClass="text-gray-500">
                              {item.subcategory2}
                            </Text>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {formatNumber(item.approved_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0))}
                        </span>
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {item.approved_products.length} {t('reports:lots') || 'lotes'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {formatNumber(item.quarantine_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0))}
                        </span>
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {item.quarantine_products.length} {t('reports:lots') || 'lotes'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {formatNumber(item.sample_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0))}
                        </span>
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {item.sample_products.length} {t('reports:lots') || 'lotes'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {formatNumber(item.return_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0))}
                        </span>
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {item.return_products.length} {t('reports:lots') || 'lotes'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {formatNumber(item.rejected_products.reduce((sum: number, prod: any) => sum + prod.quantity_units, 0))}
                        </span>
                        <Text size="xs" additionalClass="text-gray-500 mt-1">
                          {item.rejected_products.length} {t('reports:lots') || 'lotes'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900">
                          {formatNumber(getTotalQuantity(item))}
                        </Text>
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
      {productCategoryReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(productCategoryReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {productCategoryReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {productCategoryReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {productCategoryReports.is_client_filtered ? t('reports:yes') || 'Sí' : t('reports:no') || 'No'}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategoryReport;