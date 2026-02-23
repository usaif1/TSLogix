import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const MasterStatusReport: React.FC = () => {
  const { t } = useTranslation(['reports', 'common']);
  const { masterStatusReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!masterStatusReports?.data || masterStatusReports.data.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers for master status report
      const headers = [
        t('reports:date') || 'Fecha',
        t('reports:customer_code') || 'Código de Cliente',
        t('reports:customer_name') || 'Nombre del Cliente',
        t('reports:position_pallet') || 'Posición / Pallet',
        t('reports:position_type') || 'Tipo de Posición',
        t('reports:product_code') || 'Código de Producto',
        t('reports:product_name') || 'Nombre del Producto',
        t('reports:warehouse_quantity') || 'Cantidad Almacén',
        t('reports:unit_quantity') || 'Cantidad Unidades',
        t('reports:remarks') || 'Observaciones',
        t('reports:observations') || 'Notas'
      ];

      // Prepare data from master status reports
      const rows = masterStatusReports.data.map(item => [
        item.date,
        item.customer_code,
        item.customer_name,
        item.position_pallet_number,
        item.position_type,
        item.product_code,
        item.product_name,
        item.warehouse_quantity.toLocaleString(),
        item.unit_quantity.toLocaleString(),
        item.remarks || '-',
        item.observations || '-'
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_records') || 'Total de Registros', value: masterStatusReports.summary.total_records },
        { label: t('reports:total_warehouse_quantity') || 'Total Cantidad Almacén', value: masterStatusReports.summary.total_warehouse_quantity.toLocaleString() },
        { label: t('reports:total_unit_quantity') || 'Total Cantidad Unidades', value: masterStatusReports.summary.total_unit_quantity.toLocaleString() },
        { label: t('reports:unique_customers') || 'Clientes Únicos', value: masterStatusReports.summary.unique_customers },
        { label: t('reports:unique_products') || 'Productos Únicos', value: masterStatusReports.summary.unique_products }
      ];

      // Prepare metadata
      const metadata = {
        generatedAt: new Date(masterStatusReports.report_generated_at).toLocaleString(),
        filters: masterStatusReports.filters_applied,
        userRole: masterStatusReports.user_role
      };

      const exportData = convertArrayToExportData(
        t('reports:master_status_report_title') || 'Reporte Estado Maestro',
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
      console.error('Error exporting master status report:', error);
      alert(t('reports:export_failed') || 'Error en la exportación');
    }
  };

  const positionTypeBreakdown = masterStatusReports?.summary?.position_type_breakdown;

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:master_status_report_title') || 'Reporte Estado Maestro'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:master_status_report_description') || 'Snapshot actual del inventario en almacén por posición'}
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

      {/* Summary Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_records') || 'Total Registros'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {masterStatusReports?.summary?.total_records || 0}
          </Text>
        </div>

        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:total_warehouse_quantity') || 'Cant. Almacén'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {masterStatusReports?.summary?.total_warehouse_quantity?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-orange-50 p-2 rounded border border-orange-200">
          <Text size="xs" additionalClass="text-orange-600 mb-1">
            {t('reports:total_unit_quantity') || 'Cant. Unidades'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-orange-900">
            {masterStatusReports?.summary?.total_unit_quantity?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:unique_customers') || 'Clientes Únicos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {masterStatusReports?.summary?.unique_customers || 0}
          </Text>
        </div>

        <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
          <Text size="xs" additionalClass="text-indigo-600 mb-1">
            {t('reports:unique_products') || 'Productos Únicos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-indigo-900">
            {masterStatusReports?.summary?.unique_products || 0}
          </Text>
        </div>
      </div>

      {/* Summary Cards - Row 2 (Position Type Breakdown) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
          <Text size="xs" additionalClass="text-emerald-600 mb-1">
            Normal
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-emerald-900">
            {positionTypeBreakdown?.normal || 0}
          </Text>
        </div>

        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <Text size="xs" additionalClass="text-yellow-600 mb-1">
            {t('reports:quarantine') || 'Cuarentena'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-yellow-900">
            {positionTypeBreakdown?.quarantine || 0}
          </Text>
        </div>

        <div className="bg-red-50 p-2 rounded border border-red-200">
          <Text size="xs" additionalClass="text-red-600 mb-1">
            {t('reports:rejected') || 'Rechazados'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-red-900">
            {positionTypeBreakdown?.rejected || 0}
          </Text>
        </div>

        <div className="bg-cyan-50 p-2 rounded border border-cyan-200">
          <Text size="xs" additionalClass="text-cyan-600 mb-1">
            {t('reports:sample') || 'Contramuestras'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-cyan-900">
            {positionTypeBreakdown?.sample || 0}
          </Text>
        </div>

        <div className="bg-pink-50 p-2 rounded border border-pink-200">
          <Text size="xs" additionalClass="text-pink-600 mb-1">
            {t('reports:returns') || 'Devoluciones'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-pink-900">
            {positionTypeBreakdown?.returns || 0}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['master-status-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_report') || 'Cargando datos del reporte...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['master-status-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '55vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '65vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:date') || 'Fecha'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:customer') || 'Cliente'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:position') || 'Posición'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:position_type') || 'Tipo'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product') || 'Producto'}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:warehouse_qty') || 'Cant. Almacén'}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:unit_qty') || 'Cant. Unidades'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:remarks') || 'Observaciones'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!masterStatusReports?.data || masterStatusReports.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  masterStatusReports.data.map((item, index) => (
                    <tr key={`${item.position_pallet_number}-${item.product_code}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.date}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.customer_name || '-'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.customer_code || '-'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.position_pallet_number}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.position_type === 'Normal' ? 'bg-green-100 text-green-800' :
                          item.position_type === 'Quarantine' ? 'bg-yellow-100 text-yellow-800' :
                          item.position_type === 'Rejected' ? 'bg-red-100 text-red-800' :
                          item.position_type === 'Sample' ? 'bg-cyan-100 text-cyan-800' :
                          item.position_type === 'Returns' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.position_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {item.product_name || '-'}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {item.product_code || '-'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.warehouse_quantity.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.unit_quantity.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-3 py-2">
                        <div className="max-w-xs truncate">
                          {item.remarks || item.observations ? (
                            <Text size="xs" additionalClass="text-gray-600" title={`${item.remarks || ''} ${item.observations || ''}`}>
                              {item.remarks || item.observations || '-'}
                            </Text>
                          ) : (
                            <Text size="xs" additionalClass="text-gray-400">-</Text>
                          )}
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
      {masterStatusReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(masterStatusReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {masterStatusReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {masterStatusReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {masterStatusReports.is_client_filtered ? (t('reports:yes') || 'Sí') : (t('reports:no') || 'No')}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterStatusReport;
