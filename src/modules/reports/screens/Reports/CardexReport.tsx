import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { exportToExcel, exportToPDF, convertArrayToExportData } from '../../utils/exportUtils';

const CardexReport: React.FC = () => {
  const { t } = useTranslation(['reports', 'common']);
  const { cardexReports, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      if (!cardexReports?.data || cardexReports.data.length === 0) {
        alert(t('reports:no_data_available') || 'No hay datos disponibles para exportar');
        return;
      }

      // Prepare headers for product summary and movements
      const headers = [
        t('reports:product_code') || 'Código de Producto',
        t('reports:product_name') || 'Nombre del Producto',
        t('reports:client_name') || 'Cliente',
        t('reports:manufacturer') || 'Fabricante',
        t('reports:category') || 'Categoría',
        t('reports:lot_number') || 'Lote',
        t('reports:expiry_date') || 'Fecha de Vencimiento',
        t('reports:saldo_inicial') + ' (Cant.)',
        t('reports:saldo_inicial') + ' (Valor)',
        'Entradas (Cant.)',
        'Entradas (Valor)',
        'Salidas (Cant.)',
        'Salidas (Valor)',
        t('reports:saldo_final') + ' (Cant.)',
        t('reports:saldo_final') + ' (Valor)'
      ];

      // Prepare data from cardex reports
      const rows = cardexReports.data.map(item => [
        item.product_code,
        item.product_name,
        item.client_name,
        item.manufacturer,
        item.category,
        item.lot_numbers?.join(', ') || '-',
        item.expiry_dates?.map((date: string) => new Date(date).toLocaleDateString()).join(', ') || '-',
        item.opening_balance.quantity.toLocaleString(),
        `$${item.opening_balance.financial_value.toFixed(2)}`,
        item.stock_in.quantity.toLocaleString(),
        `$${item.stock_in.financial_value.toFixed(2)}`,
        item.stock_out.quantity.toLocaleString(),
        `$${item.stock_out.financial_value.toFixed(2)}`,
        item.closing_balance.quantity.toLocaleString(),
        `$${item.closing_balance.financial_value.toFixed(2)}`
      ]);

      // Prepare summary
      const summaryData = [
        { label: t('reports:total_products') || 'Total de Productos', value: cardexReports.data.length },
        { label: 'Total ' + t('reports:saldo_inicial'), value: `$${cardexReports.data.reduce((sum, item) => sum + item.opening_balance.financial_value, 0).toFixed(2)}` },
        { label: 'Total Entradas', value: `$${cardexReports.data.reduce((sum, item) => sum + item.stock_in.financial_value, 0).toFixed(2)}` },
        { label: 'Total Salidas', value: `$${cardexReports.data.reduce((sum, item) => sum + item.stock_out.financial_value, 0).toFixed(2)}` },
        { label: 'Total ' + t('reports:saldo_final'), value: `$${cardexReports.data.reduce((sum, item) => sum + item.closing_balance.financial_value, 0).toFixed(2)}` }
      ];

      // Prepare metadata
      const metadata = {
        generatedAt: new Date(cardexReports.report_generated_at).toLocaleString(),
        filters: cardexReports.filters_applied,
        userRole: cardexReports.user_role
      };

      const exportData = convertArrayToExportData(
        t('reports:cardex_report_title') || 'Reporte Cardex',
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
      console.error('Error exporting cardex report:', error);
      alert(t('reports:export_failed') || 'Error en la exportación');
    }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:cardex_report_title') || t('reports:cardex_report') || 'Reporte Cardex'}
          </Text>
          <Text size="xs" additionalClass="text-gray-600 mt-1">
            {t('reports:cardex_report_description') || 'Historial de transacciones y seguimiento de movimientos de stock'}
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
            {t('reports:total_products') || 'Productos'}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-blue-900">
            {cardexReports?.data?.length || 0}
          </Text>
        </div>
        
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <Text size="xs" additionalClass="text-green-600 mb-1">
            {t('reports:saldo_inicial')}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-green-900">
            ${cardexReports?.data?.reduce((sum, item) => sum + item.opening_balance.financial_value, 0).toFixed(2) || '0.00'}
          </Text>
        </div>
        
        <div className="bg-orange-50 p-2 rounded border border-orange-200">
          <Text size="xs" additionalClass="text-orange-600 mb-1">
            Total Entradas
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-orange-900">
            ${cardexReports?.data?.reduce((sum, item) => sum + item.stock_in.financial_value, 0).toFixed(2) || '0.00'}
          </Text>
        </div>
        
        <div className="bg-red-50 p-2 rounded border border-red-200">
          <Text size="xs" additionalClass="text-red-600 mb-1">
            Total Salidas
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-red-900">
            ${cardexReports?.data?.reduce((sum, item) => sum + item.stock_out.financial_value, 0).toFixed(2) || '0.00'}
          </Text>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-purple-50 p-2 rounded border border-purple-200">
          <Text size="xs" additionalClass="text-purple-600 mb-1">
            {t('reports:saldo_final')}
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-purple-900">
            ${cardexReports?.data?.reduce((sum, item) => sum + item.closing_balance.financial_value, 0).toFixed(2) || '0.00'}
          </Text>
        </div>
        
        <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
          <Text size="xs" additionalClass="text-indigo-600 mb-1">
            Cant. Total Entrada
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-indigo-900">
            {cardexReports?.data?.reduce((sum, item) => sum + item.stock_in.quantity, 0).toLocaleString() || '0'}
          </Text>
        </div>
        
        <div className="bg-pink-50 p-2 rounded border border-pink-200">
          <Text size="xs" additionalClass="text-pink-600 mb-1">
            Cant. Total Salida
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-pink-900">
            {cardexReports?.data?.reduce((sum, item) => sum + item.stock_out.quantity, 0).toLocaleString() || '0'}
          </Text>
        </div>
        
        <div className="bg-teal-50 p-2 rounded border border-teal-200">
          <Text size="xs" additionalClass="text-teal-600 mb-1">
            Movimientos
          </Text>
          <Text size="lg" weight="font-bold" additionalClass="text-teal-900">
            {cardexReports?.data?.reduce((sum, item) => sum + (item.movements?.length || 0), 0) || 0}
          </Text>
        </div>
      </div>

      {/* Loading State */}
      {loadingStates['cardex-reports'] && (
        <div className="text-center py-8">
          <Text size="lg" additionalClass="text-gray-600">
            {t('reports:loading_report') || 'Cargando datos del reporte...'}
          </Text>
        </div>
      )}

      {/* Data Table */}
      {!loadingStates['cardex-reports'] && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '65vh' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '75vh' }}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:product') || 'Producto'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:client_name') || 'Cliente'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:lot_number') || 'Lote'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:expiry_date') || 'Vencimiento'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:saldo_inicial')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    Entradas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    Salidas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:saldo_final')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                    {t('reports:movements') || 'Movimientos'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!cardexReports?.data || cardexReports.data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {t('reports:no_data_available') || 'No hay datos disponibles'}
                    </td>
                  </tr>
                ) : (
                  cardexReports.data.map((report, index) => (
                    <tr key={`${report.product_code}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900 text-sm">
                            {report.product_name}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {report.product_code}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {report.manufacturer}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Text weight="font-medium" additionalClass="text-gray-900">
                          {report.client_name}
                        </Text>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          {report.lot_numbers && report.lot_numbers.length > 0 ? (
                            report.lot_numbers.map((lot: string, lotIndex: number) => (
                              <Text key={lotIndex} size="xs" additionalClass="text-gray-700 block">
                                {lot}
                              </Text>
                            ))
                          ) : (
                            <Text size="xs" additionalClass="text-gray-400">-</Text>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          {report.expiry_dates && report.expiry_dates.length > 0 ? (
                            report.expiry_dates.map((date: string, dateIndex: number) => (
                              <Text key={dateIndex} size="xs" additionalClass="text-gray-700 block">
                                {new Date(date).toLocaleDateString()}
                              </Text>
                            ))
                          ) : (
                            <Text size="xs" additionalClass="text-gray-400">-</Text>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {report.opening_balance.quantity.toLocaleString()} unidades
                          </Text>
                          <Text size="xs" additionalClass="text-green-600">
                            ${report.opening_balance.financial_value.toFixed(2)}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {report.stock_in.quantity.toLocaleString()} unidades
                          </Text>
                          <Text size="xs" additionalClass="text-green-600">
                            +${report.stock_in.financial_value.toFixed(2)}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {report.stock_out.quantity.toLocaleString()} unidades
                          </Text>
                          <Text size="xs" additionalClass="text-red-600">
                            -${report.stock_out.financial_value.toFixed(2)}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <Text size="sm" additionalClass="text-gray-900">
                            {report.closing_balance.quantity.toLocaleString()} unidades
                          </Text>
                          <Text size="xs" additionalClass="text-blue-600">
                            ${report.closing_balance.financial_value.toFixed(2)}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {report.movements?.length || 0}
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
      {cardexReports && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:report_generated_at') || 'Reporte generado el'}: {new Date(cardexReports.report_generated_at).toLocaleString()}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:processing_time') || 'Tiempo de procesamiento'}: {cardexReports.processing_time_ms}ms
              </Text>
            </div>
            <div>
              <Text size="xs" additionalClass="text-gray-600">
                {t('reports:user_role') || 'Rol del usuario'}: {cardexReports.user_role}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t('reports:client_filtered') || 'Filtrado por cliente'}: {cardexReports.is_client_filtered ? (t('reports:yes') || 'Sí') : (t('reports:no') || 'No')}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardexReport; 