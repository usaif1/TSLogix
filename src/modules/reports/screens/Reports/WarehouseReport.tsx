import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const WarehouseReport: React.FC = () => {
  const { t } = useTranslation();
  const { warehouseReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!inventoryData || inventoryData.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers
      const headers = [
        t('reports:client_name') || 'Cliente',
        t('reports:product_code') || 'Código de Producto',
        t('reports:product_name') || 'Nombre del Producto',
        t('reports:manufacturer') || 'Fabricante',
        t('reports:warehouse_name') || 'Nombre del Almacén',
        t('reports:location') || 'Ubicación',
        t('reports:category') || 'Categoría',
        t('reports:status') || 'Estado de Calidad',
        t('reports:quantity') || 'Cantidad (Unidades)',
        t('reports:package_quantity') || 'Cantidad de Paquetes',
        t('reports:weight') || 'Peso (kg)',
        t('reports:volume') || 'Volumen (m³)',
        t('reports:entry_date') || 'Fecha de Entrada',
        t('reports:expiration_date') || 'Fecha de Vencimiento'
      ];

      // Prepare data
      const rows = inventoryData.map(item => [
        item.client_name,
        item.product_code,
        item.product_name,
        item.manufacturer,
        item.warehouse_name,
        `${item.warehouse_location}`,
        item.quality_statuses.join(', '),
        item.quality_statuses.join(', '),
        formatNumber(item.total_quantity),
        formatNumber(item.location_count),
        formatWeight(item.total_weight),
        formatVolume(item.total_volume),
        item.entry_dates[0] ? formatDate(item.entry_dates[0]) : 'N/A',
        'N/A'
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_positions') || 'Total de Posiciones', value: formatNumber(summary?.total_positions) },
        { label: t('reports:total_quantity') || 'Cantidad Total', value: formatNumber(summary?.total_quantity) },
        { label: t('reports:total_weight') || 'Peso Total', value: `${summary?.total_weight || 0} kg` },
        { label: t('reports:total_clients') || 'Total de Clientes', value: formatNumber(summary?.total_clients) },
        { label: t('reports:total_products') || 'Total de Productos', value: formatNumber(summary?.total_products) }
      ];

      // Prepare metadata
      const metadata = warehouseReports ? {
        generatedAt: new Date(warehouseReports.report_generated_at).toLocaleString(),
        filters: warehouseReports.filters_applied,
        userRole: warehouseReports.user_role
      } : undefined;

      const exportData = convertArrayToExportData(
        t('reports:warehouse_report_title') || 'Reporte de Almacén',
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
      console.error('Error exporting warehouse report:', error);
      alert(t('reports:export_failed') || 'Error en la exportación');
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
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

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get summary data safely
  const summary = warehouseReports?.summary;
  
  // Group products by client for table display (showing products with location_count instead of individual positions)
  const inventoryData = warehouseReports?.data?.flatMap((client) =>
    client.products.map((product) => ({
      client_name: client.client_name,
      client_id: client.client_id,
      product_id: product.product_id,
      product_code: product.product_code,
      product_name: product.product_name,
      manufacturer: product.manufacturer,
      location_count: product.location_count,
      total_quantity: product.total_quantity,
      total_weight: product.total_weight,
      total_volume: product.total_volume,
      // Get warehouse info from first position
      warehouse_name: product.positions[0]?.warehouse_name || 'N/A',
      warehouse_location: product.positions[0]?.warehouse_location || 'N/A',
      // Calculate expiry status based on positions
      has_expired: product.positions.some(p => p.is_expired),
      has_urgent: product.positions.some(p => p.is_urgent),
      has_near_expiry: product.positions.some(p => p.is_near_expiry),
      // Get quality statuses from all positions
      quality_statuses: [...new Set(product.positions.map(p => p.quality_status))],
      // Get entry dates
      entry_dates: [...new Set(product.positions.map(p => p.entry_date))]
    }))
  ) || [];

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:warehouse_report_title') || 'Reporte de Almacén'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:warehouse_report_description') || 'Reporte completo de inventario de almacén con capacidades de filtrado'}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_clients') || 'Clientes'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {formatNumber(summary?.total_clients)}
          </Text>
        </div>
        
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:total_products') || 'Productos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {formatNumber(summary?.total_products)}
          </Text>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <Text size="xs" additionalClass="text-yellow-600 mb-1">
            {t('reports:total_positions') || 'Posiciones'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-yellow-900">
            {formatNumber(summary?.total_positions)}
          </Text>
        </div>
        
        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:total_quantity') || 'Cantidad'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {formatNumber(summary?.total_quantity)}
          </Text>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
          <Text size="xs" additionalClass="text-indigo-600 mb-1">
            {t('reports:total_weight') || 'Peso'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-indigo-900">
            {formatWeight(summary?.total_weight)}
          </Text>
        </div>
      </div>

      {/* Cell Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_warehouse_cells') || 'Total de Celdas'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {formatNumber(summary?.total_warehouse_cells)}
          </Text>
        </div>
        
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:total_occupied_cells') || 'Celdas Ocupadas'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {formatNumber(summary?.total_occupied_cells)}
          </Text>
        </div>
        
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <Text size="xs" additionalClass="text-gray-600 mb-1">
            {t('reports:total_vacant_cells') || 'Celdas Vacías'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {formatNumber(summary?.total_vacant_cells)}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['warehouse-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_report') || 'Cargando datos del reporte...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['warehouse-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '65vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '75vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:client_name') || 'Cliente'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product') || 'Producto'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:warehouse') || 'Almacén'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:location_count') || 'Ubicaciones'}
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
                    {t('reports:status') || 'Estados'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:expiry_status') || 'Estado Vencimiento'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!inventoryData || inventoryData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((item) => (
                    <tr key={`${item.client_id}-${item.product_id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.client_name || 'N/A'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.product_name || 'N/A'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.product_code}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.manufacturer}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.warehouse_name || 'N/A'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.warehouse_location}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.location_count} {t('reports:locations') || 'ubicaciones'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {formatNumber(item.total_quantity)} {t('reports:units') || 'unidades'}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatWeight(item.total_weight)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatVolume(item.total_volume)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {item.quality_statuses.map((status, index) => (
                            <span key={index} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              status === 'APROBADO' ? 'bg-green-100 text-green-800' :
                              status === 'CUARENTENA' ? 'bg-yellow-100 text-yellow-800' :
                              status === 'RECHAZADOS' ? 'bg-red-100 text-red-800' :
                              status === 'DEVOLUCIONES' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {status}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${
                            item.has_expired ? 'bg-red-100 text-red-800' :
                            item.has_urgent ? 'bg-yellow-100 text-yellow-800' :
                            item.has_near_expiry ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.has_expired ? (t('reports:expired') || 'Vencido') :
                             item.has_urgent ? (t('reports:urgent') || 'Urgente') :
                             item.has_near_expiry ? (t('reports:near_expiry') || 'Por Vencer') : (t('reports:normal') || 'Normal')}
                          </span>
                        </div>
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
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(warehouseReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {warehouseReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {warehouseReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {warehouseReports.is_client_filtered ? (t('reports:yes') || 'Sí') : (t('reports:no') || 'No')}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseReport;