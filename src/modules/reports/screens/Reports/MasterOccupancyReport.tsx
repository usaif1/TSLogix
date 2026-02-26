import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const MasterOccupancyReport: React.FC = () => {
  const { t } = useTranslation(['reports', 'common']);
  const { masterOccupancyReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!masterOccupancyReports?.data || masterOccupancyReports.data.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers for master occupancy report
      const headers = [
        t('reports:warehouse') || 'Almacen',
        t('reports:date') || 'Fecha',
        t('reports:total_positions') || 'Total Posiciones',
        t('reports:total_normal') || 'Total Normal',
        t('reports:total_samples') || 'Total Muestras',
        t('reports:total_rejected') || 'Total Rechazados',
        t('reports:total_occupied') || 'Total Ocupados',
        t('reports:occupied_normal') || 'Ocupados Normal',
        t('reports:occupied_samples') || 'Ocupados Muestras',
        t('reports:occupied_rejected') || 'Ocupados Rechazados',
        t('reports:total_available') || 'Total Disponibles',
        t('reports:available_normal') || 'Disponibles Normal',
        t('reports:available_samples') || 'Disponibles Muestras',
        t('reports:available_rejected') || 'Disponibles Rechazados',
        t('reports:occupancy_rate') || 'Tasa de Ocupacion (%)',
      ];

      // Prepare data from master occupancy reports
      const rows = masterOccupancyReports.data.map(item => [
        item.warehouse,
        item.date,
        item.total_positions,
        item.total_normal_positions,
        item.total_samples_positions,
        item.total_rejected_positions,
        item.total_occupied_positions,
        item.occupied_normal_positions,
        item.occupied_samples_positions,
        item.occupied_rejected_positions,
        item.total_available_positions,
        item.available_normal_positions,
        item.available_samples_positions,
        item.available_rejected_positions,
        `${item.occupancy_rate}%`,
      ]);

      // Prepare summary
      const summary = masterOccupancyReports.summary;
      const summaryData = [
        { label: t('reports:total_warehouses') || 'Total Almacenes', value: summary.total_warehouses },
        { label: t('reports:grand_total_positions') || 'Gran Total Posiciones', value: summary.grand_total_positions },
        { label: t('reports:grand_total_occupied') || 'Gran Total Ocupados', value: summary.grand_total_occupied },
        { label: t('reports:grand_total_available') || 'Gran Total Disponibles', value: summary.grand_total_available },
        { label: t('reports:overall_occupancy_rate') || 'Tasa de Ocupacion General', value: `${summary.overall_occupancy_rate}%` },
      ];

      // Prepare metadata
      const metadata = {
        generatedAt: new Date(masterOccupancyReports.report_generated_at).toLocaleString(),
        filters: masterOccupancyReports.filters_applied,
        userRole: masterOccupancyReports.user_role
      };

      const exportData = convertArrayToExportData(
        t('reports:master_occupancy_report_title') || 'Reporte Ocupacion Maestro',
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
      console.error('Error exporting master occupancy report:', error);
      alert(t('reports:export_failed') || 'Error en la exportacion');
    }
  };

  const summary = masterOccupancyReports?.summary;

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:master_occupancy_report_title') || 'Reporte Ocupacion Maestro'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:master_occupancy_report_description') || 'Estado de capacidad y ocupacion del almacen por tipo de posicion'}
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

      {/* Summary Cards - Row 1: Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_warehouses') || 'Total Almacenes'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {summary?.total_warehouses || 0}
          </Text>
        </div>

        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <Text size="xs" additionalClass="text-gray-600 mb-1">
            {t('reports:grand_total_positions') || 'Total Posiciones'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {summary?.grand_total_positions?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:total_normal') || 'Total Normal'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {summary?.grand_total_normal?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-cyan-50 p-2 rounded border border-cyan-200">
          <Text size="xs" additionalClass="text-cyan-600 mb-1">
            {t('reports:total_samples') || 'Total Muestras'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-cyan-900">
            {summary?.grand_total_samples?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-red-50 p-2 rounded border border-red-200">
          <Text size="xs" additionalClass="text-red-600 mb-1">
            {t('reports:total_rejected') || 'Total Rechazados'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-red-900">
            {summary?.grand_total_rejected?.toLocaleString() || 0}
          </Text>
        </div>
      </div>

      {/* Summary Cards - Row 2: Occupancy */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-orange-50 p-2 rounded border border-orange-200">
          <Text size="xs" additionalClass="text-orange-600 mb-1">
            {t('reports:total_occupied') || 'Total Ocupados'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-orange-900">
            {summary?.grand_total_occupied?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
          <Text size="xs" additionalClass="text-emerald-600 mb-1">
            {t('reports:total_available') || 'Total Disponibles'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-emerald-900">
            {summary?.grand_total_available?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:occupancy_rate') || 'Tasa de Ocupacion'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {summary?.overall_occupancy_rate || '0.00'}%
          </Text>
        </div>

        <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
          <Text size="xs" additionalClass="text-indigo-600 mb-1">
            {t('reports:occupied_normal') || 'Ocupados Normal'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-indigo-900">
            {summary?.grand_occupied_normal?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-pink-50 p-2 rounded border border-pink-200">
          <Text size="xs" additionalClass="text-pink-600 mb-1">
            {t('reports:available_normal') || 'Disponibles Normal'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-pink-900">
            {summary?.grand_available_normal?.toLocaleString() || 0}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['master-occupancy-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_report') || 'Cargando datos del reporte...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['master-occupancy-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '50vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '60vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:warehouse') || 'Almacen'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:date') || 'Fecha'}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50" colSpan={4}>
                    {t('reports:total_positions') || 'Total Posiciones'}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50" colSpan={4}>
                    {t('reports:occupied') || 'Ocupados'}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50" colSpan={4}>
                    {t('reports:available') || 'Disponibles'}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:rate') || 'Tasa %'}
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-3 py-1 text-left text-xs font-medium text-gray-400 sticky top-8 bg-gray-100"></th>
                  <th className="px-3 py-1 text-left text-xs font-medium text-gray-400 sticky top-8 bg-gray-100"></th>
                  {/* Total columns */}
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Total</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Normal</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Muestras</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Rechaz.</th>
                  {/* Occupied columns */}
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Total</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Normal</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Muestras</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Rechaz.</th>
                  {/* Available columns */}
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Total</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Normal</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Muestras</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-400 sticky top-8 bg-gray-100">Rechaz.</th>
                  <th className="px-3 py-1 text-right text-xs font-medium text-gray-400 sticky top-8 bg-gray-100"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!masterOccupancyReports?.data || masterOccupancyReports.data.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  masterOccupancyReports.data.map((item, index) => (
                    <tr key={`${item.warehouse_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                          {item.warehouse}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-600">
                          {item.date}
                        </Text>
                      </td>
                      {/* Total positions */}
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <Text weight="font-semibold" additionalClass="text-gray-900 text-sm">
                          {item.total_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <Text size="sm" additionalClass="text-green-700">
                          {item.total_normal_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <Text size="sm" additionalClass="text-cyan-700">
                          {item.total_samples_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <Text size="sm" additionalClass="text-red-700">
                          {item.total_rejected_positions.toLocaleString()}
                        </Text>
                      </td>
                      {/* Occupied */}
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-orange-50">
                        <Text weight="font-semibold" additionalClass="text-orange-800 text-sm">
                          {item.total_occupied_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-orange-50">
                        <Text size="sm" additionalClass="text-orange-700">
                          {item.occupied_normal_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-orange-50">
                        <Text size="sm" additionalClass="text-orange-700">
                          {item.occupied_samples_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-orange-50">
                        <Text size="sm" additionalClass="text-orange-700">
                          {item.occupied_rejected_positions.toLocaleString()}
                        </Text>
                      </td>
                      {/* Available */}
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-green-50">
                        <Text weight="font-semibold" additionalClass="text-green-800 text-sm">
                          {item.total_available_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-green-50">
                        <Text size="sm" additionalClass="text-green-700">
                          {item.available_normal_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-green-50">
                        <Text size="sm" additionalClass="text-green-700">
                          {item.available_samples_positions.toLocaleString()}
                        </Text>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center bg-green-50">
                        <Text size="sm" additionalClass="text-green-700">
                          {item.available_rejected_positions.toLocaleString()}
                        </Text>
                      </td>
                      {/* Occupancy Rate */}
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parseFloat(item.occupancy_rate) >= 80 ? 'bg-red-100 text-red-800' :
                          parseFloat(item.occupancy_rate) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.occupancy_rate}%
                        </span>
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
      {masterOccupancyReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(masterOccupancyReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {masterOccupancyReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {masterOccupancyReports.user_role}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterOccupancyReport;
