import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';

const CardexReport: React.FC = () => {
  const { t } = useTranslation();
  const { cardexReports, exportReport, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      await exportReport('cardex', format);
    } catch (error) {
      console.error('Error exporting cardex report:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text size="xl" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:cardex_report')}
          </Text>
          <Text size="sm" additionalClass="text-gray-600 mt-1">
            {t('reports:cardex_report_description')}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-blue-600 mb-1">
            {t('reports:total_transactions')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-blue-900">
            {cardexReports.length}
          </Text>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-green-600 mb-1">
            {t('reports:in_transactions')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-green-900">
            {cardexReports.filter(report => report.transaction_type === 'IN').length}
          </Text>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-red-600 mb-1">
            {t('reports:out_transactions')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-red-900">
            {cardexReports.filter(report => report.transaction_type === 'OUT').length}
          </Text>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-purple-600 mb-1">
            {t('reports:unique_products')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-purple-900">
            {new Set(cardexReports.map(report => report.product_code)).size}
          </Text>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:product_code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:product_name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:transaction_type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:weight')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:balance_quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:balance_weight')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:reference')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cardexReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    {t('reports:no_data_available')}
                  </td>
                </tr>
              ) : (
                cardexReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text weight="font-medium" additionalClass="text-gray-900">
                        {report.product_code}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text additionalClass="text-gray-900">
                        {report.product_name}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.transaction_type === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {report.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.weight.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.balance_quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.balance_weight.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.reference}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardexReport; 