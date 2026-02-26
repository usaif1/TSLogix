import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const StockOutReport: React.FC = () => {
  const { t } = useTranslation(['reports', 'common']);
  const { stockOutReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!stockOutReports?.data || stockOutReports.data.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers for stock out report
      const headers = [
        t('reports:period') || 'Periodo',
        t('reports:dispatch_order_number') || 'N. Orden Despacho',
        t('reports:dispatch_order_date_time') || 'Fecha/Hora Orden',
        t('reports:stock_out_date') || 'Fecha/Hora Despacho',
        t('reports:customer_code') || 'Codigo Cliente',
        t('reports:customer_name') || 'Nombre Cliente',
        t('reports:guia_remision') || 'Guia de Remision',
        t('reports:guia_transporte') || 'Guia de Transporte',
        t('reports:order_dispatcher') || 'Despachador',
        t('reports:remarks') || 'Observaciones',
        t('reports:observations') || 'Notas'
      ];

      // Prepare data from stock out reports
      const rows = stockOutReports.data.map(item => [
        item.period,
        item.dispatch_order_number,
        item.dispatch_order_date_time ? new Date(item.dispatch_order_date_time).toLocaleString() : '-',
        item.stock_out_date_time ? new Date(item.stock_out_date_time).toLocaleString() : '-',
        item.customer_code,
        item.customer_name,
        item.guia_remision_number || '-',
        item.guia_transporte_number || '-',
        item.order_dispatcher || '-',
        item.remarks || '-',
        item.observations || '-'
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_orders') || 'Total de Ordenes', value: stockOutReports.summary.total_orders },
        { label: t('reports:dispatched_orders') || 'Ordenes Despachadas', value: stockOutReports.summary.dispatched_orders },
        { label: t('reports:pending_orders') || 'Ordenes Pendientes', value: stockOutReports.summary.pending_orders },
        { label: t('reports:total_pallets') || 'Total de Pallets', value: stockOutReports.summary.total_pallets },
        { label: t('reports:unique_customers') || 'Clientes Unicos', value: stockOutReports.summary.unique_customers }
      ];

      // Prepare metadata
      const metadata = {
        generatedAt: new Date(stockOutReports.report_generated_at).toLocaleString(),
        filters: stockOutReports.filters_applied,
        userRole: stockOutReports.user_role
      };

      const exportData = convertArrayToExportData(
        t('reports:stock_out_report_title') || 'Reporte Stock Out',
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
      console.error('Error exporting stock out report:', error);
      alert(t('reports:export_failed') || 'Error en la exportacion');
    }
  };

  const ordersByStatus = stockOutReports?.summary?.orders_by_status || {};

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:stock_out_report_title') || 'Reporte Stock Out'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:stock_out_report_description') || 'Resumen mensual de todas las ordenes de despacho'}
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <Text size="xs" additionalClass="text-blue-600 mb-1">
            {t('reports:total_orders') || 'Total Ordenes'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {stockOutReports?.summary?.total_orders || 0}
          </Text>
        </div>

        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:dispatched') || 'Despachadas'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            {stockOutReports?.summary?.dispatched_orders || 0}
          </Text>
        </div>

        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <Text size="xs" additionalClass="text-yellow-600 mb-1">
            {t('reports:pending') || 'Pendientes'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-yellow-900">
            {stockOutReports?.summary?.pending_orders || 0}
          </Text>
        </div>

        <div className="bg-orange-50 p-2 rounded border border-orange-200">
          <Text size="xs" additionalClass="text-orange-600 mb-1">
            {t('reports:total_pallets') || 'Total Pallets'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-orange-900">
            {stockOutReports?.summary?.total_pallets?.toLocaleString() || 0}
          </Text>
        </div>

        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:unique_customers') || 'Clientes Unicos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            {stockOutReports?.summary?.unique_customers || 0}
          </Text>
        </div>
      </div>

      {/* Status Breakdown */}
      {Object.keys(ordersByStatus).length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="bg-gray-50 p-2 rounded border border-gray-200">
              <Text size="xs" additionalClass="text-gray-600 mb-1">
                {status}
              </Text>
              <Text size="md" weight="font-bold" additionalClass="text-gray-900">
                {count as number}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loadingStates['stock-out-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_report') || 'Cargando datos del reporte...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['stock-out-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '55vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '65vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:period') || 'Periodo'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:dispatch_order') || 'Orden Despacho'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:order_date') || 'Fecha Orden'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:dispatch_date') || 'Fecha Despacho'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:customer') || 'Cliente'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:guia_remision') || 'Guia Remision'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:guia_transporte') || 'Guia Transporte'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:dispatcher') || 'Despachador'}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:status') || 'Estado'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!stockOutReports?.data || stockOutReports.data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  stockOutReports.data.map((item, index) => (
                    <tr key={`${item.dispatch_order_number}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.period}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-blue-600 text-sm">
                          {item.dispatch_order_number}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.dispatch_order_date_time ? new Date(item.dispatch_order_date_time).toLocaleString() : '-'}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.stock_out_date_time ? new Date(item.stock_out_date_time).toLocaleString() : '-'}
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
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.guia_remision_number || '-'}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.guia_transporte_number || '-'}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Text size="sm" additionalClass="text-gray-900">
                          {item.order_dispatcher || '-'}
                        </Text>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.dispatch_status === 'DISPATCHED' ? 'bg-green-100 text-green-800' :
                          item.dispatch_status === 'DISPATCHING' ? 'bg-yellow-100 text-yellow-800' :
                          item.dispatch_status === 'NOT_DISPATCHED' ? 'bg-red-100 text-red-800' :
                          item.order_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          item.order_status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          item.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.dispatch_status || item.order_status || '-'}
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
      {stockOutReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(stockOutReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {stockOutReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {stockOutReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {stockOutReports.is_client_filtered ? (t('reports:yes') || 'Si') : (t('reports:no') || 'No')}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOutReport;
