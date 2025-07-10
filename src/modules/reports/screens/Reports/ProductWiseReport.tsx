import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const ProductWiseReport: React.FC = () => {
  const { t } = useTranslation();
  const { productWiseReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!reportData || reportData.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers
      const headers = [
        t('reports:client_name') || 'Cliente',
        t('reports:type') || 'Tipo',
        t('reports:product_code') || 'Código de Producto',
        t('reports:product_name') || 'Nombre del Producto',
        t('reports:manufacturer') || 'Fabricante',
        t('reports:category') || 'Categoría',
        t('reports:order_code') || 'Código de Orden',
        t('reports:lot_number') || 'Número de Lote',
        t('reports:quantity') || 'Cantidad (Unidades)',
        t('reports:package_quantity') || 'Cantidad de Paquetes',
        t('reports:warehouse_quantity') || 'Cantidad en Almacén',
        t('reports:weight') || 'Peso',
        t('reports:volume') || 'Volumen',
        t('reports:date') || 'Fecha',
        t('reports:warehouse_name') || 'Nombre del Almacén'
      ];

      // Prepare data
      const rows = reportData.map(item => [
        item.client_name,
        item.type === 'STOCK_IN' ? (t('reports:in') || 'ENTRADA') : (t('reports:out') || 'SALIDA'),
        item.product_code,
        item.product_name,
        item.manufacturer,
        item.category,
        item.type === 'STOCK_IN' ? item.entry_order_code : item.departure_order_code,
        item.lot_number || 'N/A',
        formatNumber(item.quantity_units),
        formatNumber(item.package_quantity),
        formatNumber(item.warehouse_quantity),
        formatWeight(item.weight),
        formatVolume(item.volume),
        formatDate(item.type === 'STOCK_IN' ? item.entry_date || '' : item.departure_date || ''),
        item.warehouse_name || 'N/A'
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_records') || 'Total de Registros', value: formatNumber(summary?.total_records) },
        { label: t('reports:stock_in_records') || 'Registros de Entrada', value: formatNumber(summary?.stock_in_records) },
        { label: t('reports:stock_out_records') || 'Registros de Salida', value: formatNumber(summary?.stock_out_records) },
        { label: t('reports:net_movement') || 'Movimiento Neto', value: formatNumber((summary?.total_stock_in_quantity || 0) - (summary?.total_stock_out_quantity || 0)) },
        { label: t('reports:total_stock_in_qty') || 'Cantidad Total de Entradas', value: formatNumber(summary?.total_stock_in_quantity) },
        { label: t('reports:total_stock_out_qty') || 'Cantidad Total de Salidas', value: formatNumber(summary?.total_stock_out_quantity) }
      ];

      // Prepare metadata
      const metadata = productWiseReports ? {
        generatedAt: new Date(productWiseReports.report_generated_at).toLocaleString(),
        filters: productWiseReports.filters_applied,
        userRole: productWiseReports.user_role
      } : undefined;

      const exportData = convertArrayToExportData(
        t('reports:product_wise_report_title') || 'Reporte de Productos por Movimiento',
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
      console.error('Error exporting product wise report:', error);
      alert(t('reports:export_failed') || 'Error en la exportación');
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
  const formatWeight = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '0.00 kg';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.00 kg';
    return `${numValue.toFixed(2)} kg`;
  };

  // Helper function to safely format volume
  const formatVolume = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)} m³`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get data safely
  const summary = productWiseReports?.summary;
  const reportData = productWiseReports?.data || [];

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:product_wise_report') || 'Reporte de Productos por Movimiento'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:product_wise_description') || 'Movimientos de entrada y salida de stock por producto'}
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
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_records') || 'Total'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {formatNumber(summary?.total_records)}
          </Text>
        </div>
        
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:stock_in_records') || 'Entradas'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {formatNumber(summary?.stock_in_records)}
          </Text>
        </div>
        
        <div className="bg-red-50 p-2 rounded border border-red-200">
          <Text size="xs" additionalClass="text-red-600 mb-1">
            {t('reports:stock_out_records') || 'Salidas'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-red-900">
            {formatNumber(summary?.stock_out_records)}
          </Text>
        </div>
        
        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:net_movement') || 'Neto'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {formatNumber((summary?.total_stock_in_quantity || 0) - (summary?.total_stock_out_quantity || 0))}
          </Text>
        </div>
        
        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
          <Text size="xs" additionalClass="text-emerald-600 mb-1">
            {t('reports:total_stock_in_qty') || 'Cant. Ent.'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-emerald-900">
            {formatNumber(summary?.total_stock_in_quantity)}
          </Text>
        </div>
        
        <div className="bg-rose-50 p-2 rounded border border-rose-200">
          <Text size="xs" additionalClass="text-rose-600 mb-1">
            {t('reports:total_stock_out_qty') || 'Cant. Sal.'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-rose-900">
            {formatNumber(summary?.total_stock_out_quantity)}
          </Text>
        </div>
        
        <div className="bg-amber-50 p-2 rounded border border-amber-200">
          <Text size="xs" additionalClass="text-amber-600 mb-1">
            {t('reports:stock_in_value') || 'Val. Ent.'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-amber-900">
            {formatCurrency(summary?.total_stock_in_value)}
          </Text>
        </div>
        
        <div className="bg-cyan-50 p-2 rounded border border-cyan-200">
          <Text size="xs" additionalClass="text-cyan-600 mb-1">
            {t('reports:stock_out_value') || 'Val. Sal.'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-cyan-900">
            {formatCurrency(summary?.total_stock_out_value)}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['product-wise-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_product_wise') || 'Cargando datos del reporte de productos...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['product-wise-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '65vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '75vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:client_name') || 'Cliente'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:type') || 'Tipo'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product_code') || 'Código'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product_name') || 'Producto'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:order_info') || 'Información de Orden'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:lot_number') || 'Número de Lote'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:quantity') || 'Cantidad'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:weight') || 'Peso'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:volume') || 'Volumen'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:date') || 'Fecha'}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.type === 'STOCK_IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type === 'STOCK_IN' ? t('reports:in') || 'ENTRADA' : t('reports:out') || 'SALIDA'}
                        </span>
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
                            {item.type === 'STOCK_IN' ? item.entry_order_code : item.departure_order_code}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.warehouse_name}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lot_number || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {formatNumber(item.quantity_units)} {t('reports:units') || 'unidades'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {formatNumber(item.package_quantity)} {t('reports:packages') || 'paquetes'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {formatNumber(item.warehouse_quantity)} {t('reports:warehouse') || 'almacén'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatWeight(item.weight)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatVolume(item.volume)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.type === 'STOCK_IN' ? item.entry_date || '' : item.departure_date || '')}
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
      {productWiseReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(productWiseReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {productWiseReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {productWiseReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {productWiseReports.is_client_filtered ? t('reports:yes') || 'Sí' : t('reports:no') || 'No'}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductWiseReport;